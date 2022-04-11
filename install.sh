#!/bin/bash

install_accio() {
  available_targets=("x86_64-unknown-linux-gnu" "x86_64-apple-darwin" "aarch64-apple-darwin")
  os_str="$(uname -s)"
  arch_str="$(uname -m)"

  if [[ "${arch_str}" == "aarch64" || "${arch_str}" == "arm64" ]]; then
    arch_str="aarch64"
  elif [[ "${arch_str}" == "x86_64" ]]; then
    arch_str="x86_64"
  else
    echo "Unsupported processor architecture: ${arch_str}"
    return 1
  fi

  if [[ "${os_str}" == "Darwin" ]]; then
    os_str="apple-darwin"
  elif [[ "${os_str}" == "Linux" ]]; then
    os_str="unknown-linux-gnu"
  else
    echo "Unsupported operating system: ${os_str}"
    return 1
  fi

  current_target="${arch_str}-${os_str}"
  if [[ ! " ${available_targets[*]} " =~ " ${current_target} " ]]; then
    echo "No target of type: ${current_target}"
    return 1
  fi

  install_dir="$1"
  if [[ "${install_dir}" == "" ]]; then
    install_dir="${HOME}/bin"
  fi
  echo "Installing ${current_target} to ${install_dir}..."
  prep_path "${install_dir}"

  tar_file="$(download_release ${current_target})"
  tar zxf "${tar_file}" --directory="${install_dir}"

  echo "Done!"
}

download_release() {
  download_dir="$(xdg-user-dir DOWNLOAD)" || download_dir="${HOME}/Downloads"
  mkdir -p "${download_dir}"
  file_basename="$1.tar"

  # TODO(stabai): Point to release target from github.
  file_url="https://localhost/${file_basename}"
  wget "${file_url}" --directory-prefix="${download_dir}"
  echo "${download_dir}/${file_basename}"
}

add_to_path() {
  export PATH="$1:${PATH}"
  shrc_file="$HOME/.bashrc"
  if [[ $SHELL == */zsh ]]; then
    shrc_file="$HOME/.zshrc"
  fi
  echo "export PATH=\"${1}:\$PATH\"" >> $shrc_file
}

prep_path() {
  mkdir -p "$1"
  paths_arr=(${PATH//:/ })
  if [[ ! " ${paths_arr[*]} " =~ " $1 " ]]; then
    add_to_path "$1"
  fi
}

install_accio $@
