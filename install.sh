#!/bin/bash

# TODO(stabai): After there's been a real release, query the latest instead.
current_version="v0.0.1"

shrc_file="${HOME}/.bashrc"
if [[ ${SHELL} == */zsh ]]; then
  shrc_file="${HOME}/.zshrc"
fi

print_error() {
  echo
  >&2 echo "$(tput bold)$(tput setaf 1)ERROR:$(tput sgr0) $1"
}

print_warning() {
  echo
  echo "$(tput bold)$(tput setaf 3)WARNING:$(tput sgr0) $1"
}

print_success() {
  echo
  echo "$(tput bold)$(tput setaf 2)SUCCESS:$(tput sgr0) $1"
}

install_accio() {
  uid="$(id -u)"
  if [[ "${uid}" != "0" ]]; then
    print_warning "Installing accio as root is strongly encouraged."
    read -p "Are you sure (y/n)? " confirm_root
    if ! [[ "${confirm_root}" =~ ^[Yy]$ ]]; then
      return 1
    fi
    echo
  fi

  if [[ "$(command -v accio)" != "" ]]; then
    print_warning "Accio appears to already be installed."
    read -p "Are you sure (y/n)? " confirm_root
    if ! [[ "${confirm_root}" =~ ^[Yy]$ ]]; then
      return 1
    fi
    echo
  fi

  available_targets=("x86_64-unknown-linux-gnu" "x86_64-apple-darwin" "aarch64-apple-darwin")
  os_str="$(uname -s)"
  arch_str="$(uname -m)"

  if [[ "${arch_str}" == "aarch64" || "${arch_str}" == "arm64" ]]; then
    arch_str="aarch64"
  elif [[ "${arch_str}" == "x86_64" ]]; then
    arch_str="x86_64"
  else
    print_error "Unsupported processor architecture: ${arch_str}"
    return 1
  fi

  if [[ "${os_str}" == "Darwin" ]]; then
    os_str="apple-darwin"
  elif [[ "${os_str}" == "Linux" ]]; then
    os_str="unknown-linux-gnu"
  else
    print_error "Unsupported operating system: ${os_str}"
    return 1
  fi

  current_target="${arch_str}-${os_str}"
  if [[ ! " ${available_targets[*]} " =~ " ${current_target} " ]]; then
    print_error "No target of type: ${current_target}"
    return 1
  fi

  install_dir="$1"
  if [[ "$1" != "" ]]; then
    install_dir="$1"
  elif [[ "${uid}" == "0" ]]; then
    install_dir="/usr/local/bin"
  else
    install_dir="${HOME}/bin"
  fi

  check_in_path "${install_dir}" || add_to_shrc="${shrc_file}"

  echo "This will install accio ${current_target} to: ${install_dir}"
  if [[ "${add_to_shrc}" != "" ]]; then
    echo "The directory will also be added to PATH in: ${add_to_shrc}"
  fi
  read -p "Continue (y/n)? " confirm_install
  if ! [[ "${confirm_install}" =~ ^[Yy]$ ]]; then
    return 1
  fi

  echo
  echo "Preparing ${install_dir}..."
  mkdir -p "${install_dir}"

  if [[ "${add_to_shrc}" != "" ]]; then
    # Sometimes rc files add $HOME/bin to PATH only if it exists. So in case we
    # just created it, let's source the file again.
    source "${add_to_shrc}"
    check_in_path "${install_dir}" || add_to_shrc="${shrc_file}"
  fi

  if [[ "${add_to_shrc}" != "" ]]; then
    echo
    echo "Adding ${install_dir} to PATH in ${add_to_shrc}..."
    add_to_path "${install_dir}" "${add_to_shrc}"
  fi

  download_dir="$(ensure_download_dir)"
  file_basename="$(get_release_file_basename ${current_target})"
  file_url="$(get_release_url ${file_basename})"
  local_tar_file="${download_dir}/${file_basename}"

  echo
  echo "Downloading release archive..."
  echo "  from: ${file_url}"
  echo "  to:   ${local_tar_file}"
  wget "${file_url}" --output-document="${local_tar_file}" || download_error="1"
  if [[ "${download_error}" == "1" ]]; then
    print_error "Unable to download release archive: ${file_url}"
    return 1
  fi

  echo
  echo "Installing..."
  echo "  from: ${local_tar_file}"
  echo "  to:   ${install_dir}"
  tar zxf "${local_tar_file}" --directory="${install_dir}" || tar_error="1"
  if [[ "${tar_error}" == "1" ]]; then
    print_error "Unable to extract archive: ${local_tar_file}"
    return 1
  fi

  print_success "Installation complete."
  echo "Run $(tput bold)accio$(tput sgr0) to start installing software!"
}

get_release_url() {
  # TODO(stabai): After there's been a real release, query the latest here.
  # current_version="$(curl -s https://api.github.com/repos/stabai/accio/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \"\, | xargs)"
  echo "https://github.com/stabai/accio/releases/download/${current_version}/$1"
}

get_release_file_basename() {
  echo "accio-$1.tar.gz"
}

ensure_download_dir() {
  download_dir="$(xdg-user-dir DOWNLOAD)" 2>/dev/null || download_dir="${HOME}/Downloads"
  mkdir -p "${download_dir}"
  echo "${download_dir}"
}

add_to_path() {
  export PATH="$1:${PATH}"
  echo "export PATH=\"${1}:\$PATH\"" >> "$2"
}

check_in_path() {
  paths_arr=(${PATH//:/ })
  if [[ " ${paths_arr[*]} " =~ " $1 " ]]; then
    return 0
  else
    return 1
  fi
}

prep_path() {
  mkdir -p "$1"
  paths_arr=(${PATH//:/ })
  if [[ ! " ${paths_arr[*]} " =~ " $1 " ]]; then
    add_to_path "$1"
  fi
}

install_accio $@
