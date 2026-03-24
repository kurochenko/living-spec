#!/bin/bash
#
# lore installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/kurochenko/lore/master/install.sh | bash
#
# Options (via environment variables):
#   LORE_INSTALL_DIR - Installation directory for npm global install (default: auto-detected)
#   LORE_VERSION     - Specific version to install (default: latest)
#
# This script:
# 1. Checks Node.js is installed
# 2. Fetches latest release tag from GitHub
# 3. Downloads the npm tarball from GitHub Releases
# 4. Installs globally via npm

set -euo pipefail

REPO="kurochenko/lore"
PACKAGE_NAME="kurochenko-lore"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info() {
	echo -e "${CYAN}info${NC}: $1"
}

success() {
	echo -e "${GREEN}success${NC}: $1"
}

warn() {
	echo -e "${YELLOW}warn${NC}: $1"
}

error() {
	echo -e "${RED}error${NC}: $1"
	exit 1
}

check_node() {
	if ! command -v node &>/dev/null; then
		error "Node.js is not installed. Please install Node.js >= 20 first: https://nodejs.org/"
	fi

	local version
	version=$(node -v | sed 's/v//')
	local major
	major=$(echo "$version" | cut -d. -f1)
	if [ "$major" -lt 20 ]; then
		error "Node.js >= 20 is required. Current version: $version"
	fi
	info "Node.js version: $(node -v)"
}

check_npm() {
	if ! command -v npm &>/dev/null; then
		error "npm is not installed. Please install Node.js which includes npm."
	fi
	info "npm version: $(npm -v)"
}

get_latest_tag() {
	local url="https://api.github.com/repos/${REPO}/releases/latest"

	if command -v curl &>/dev/null; then
		curl -fsSL "$url" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p'
	elif command -v wget &>/dev/null; then
		wget -qO- "$url" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p'
	else
		error "Neither curl nor wget found. Please install one of them."
	fi
}

get_tarball_url() {
	local tag="$1"
	local url="https://api.github.com/repos/${REPO}/releases/latest"

	local tarball_name
	if command -v curl &>/dev/null; then
		tarball_name=$(curl -fsSL "$url" | grep -o '"name": *"kurochenko-lore-[^"]*\.tgz"' | head -1 | sed 's/.*"name": *"\([^"]*\)".*/\1/')
	elif command -v wget &>/dev/null; then
		tarball_name=$(wget -qO- "$url" | grep -o '"name": *"kurochenko-lore-[^"]*\.tgz"' | head -1 | sed 's/.*"name": *"\([^"]*\)".*/\1/')
	fi

	if [ -z "$tarball_name" ]; then
		error "Could not find tarball in latest release"
	fi

	echo "https://github.com/${REPO}/releases/download/${tag}/${tarball_name}"
}

resolve_tag() {
	local input="$1"
	if [[ "$input" == lore-* ]]; then
		echo "$input"
		return
	fi
	if [[ "$input" == v* ]]; then
		echo "$input"
		return
	fi
	echo "lore-v${input}"
}

download() {
	local url="$1"
	local dest="$2"

	info "Downloading from ${url}..."

	if command -v curl &>/dev/null; then
		curl -fsSL "$url" -o "$dest"
	elif command -v wget &>/dev/null; then
		wget -q "$url" -O "$dest"
	else
		error "Neither curl nor wget found."
	fi
}

main() {
	echo ""
	echo -e "${CYAN}  lore installer${NC}"
	echo ""

	check_node
	check_npm

	local tag="${LORE_VERSION:-}"
	if [ -z "$tag" ]; then
		info "Fetching latest version..."
		tag=$(get_latest_tag)
		if [ -z "$tag" ]; then
			error "Could not determine latest version"
		fi
	else
		tag=$(resolve_tag "$tag")
	fi

	info "Installing version: ${tag}"

	local tarball_url
	tarball_url=$(get_tarball_url "$tag")

	local tmp_file
	tmp_file=$(mktemp)
	trap 'rm -f "${tmp_file:-}"' EXIT

	download "$tarball_url" "$tmp_file"

	info "Installing globally via npm..."
	if ! npm install -g "$tmp_file" 2>/dev/null; then
		rm -f "${tmp_file:-}"
		error "npm install -g failed. Try running with sudo:"
		echo "  sudo curl -fsSL https://raw.githubusercontent.com/${REPO}/master/install.sh | bash"
		exit 1
	fi

	trap - EXIT
	rm -f "${tmp_file:-}"

	success "lore installed successfully"

	if command -v lore &>/dev/null; then
		echo ""
		echo "Run 'lore --help' to get started."
		echo ""
	fi
}

main "$@"