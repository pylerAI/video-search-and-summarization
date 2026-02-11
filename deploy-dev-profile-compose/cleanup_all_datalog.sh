#!/bin/bash

script_dir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
delete_calibration_data="true"
delete_vst_data="true"
env_file="${script_dir}/.env"

function usage() {
  echo "Usage: ${script_name} (-h|--help)"
  echo "   or: ${script_name} [options]"
  echo ""
  echo "options:"
  echo "-e, --env-file                      path to env file used to start the blueprint"
  echo "-b, --blueprint                     name of the blueprint, one of warehouse / public-safety / smartcities"
  echo "-d, --dev-profile                   name of the dev-profile, one of base / lvs / alerts / search"
  echo "--skip-delete-calibration-data      skip deletion of calibration data"
  echo "--skip-delete-vst-data              skip deletion of vst data"
  echo "-h, --help                          provide usage information"
  echo ""
  echo "note: only one of env-file or blueprint should be provided"
  echo ""
}

function process_args() {
  local _args _all_good _valid_args _need_help _env_files
  _args=("${@}")
  _all_good=0
  _need_help="false"
  _env_files=()
  _valid_args=$(getopt -q -o e:b:d:h --long env-file:,blueprint:,dev-profile:,skip-delete-calibration-data,skip-delete-vst-data,help -- "${_args[@]}")
  _all_good=$(( _all_good + $? ))
  if [[ _all_good -gt 0 ]]; then
    echo ""
    echo "Invalid usage: ${_args[*]}"
    usage
    exit 1
  else
    eval set -- "${_valid_args}"
    while true; do
      case "${1}" in
        -e | --env-file) shift; _env_files+=("${1}"); shift; ;;
        -b | --blueprint) shift; _env_files+=("${script_dir}/${1}/.env"); shift; ;;
        -d | --dev-profile) shift; _env_files+=("${script_dir}/developer-workflow/dev-profile-${1}/.env"); shift; ;;
        --skip-delete-calibration-data) delete_calibration_data="false"; shift; ;;
        --skip-delete-vst-data) delete_vst_data="false"; shift; ;;
        -h | --help) _need_help="true"; shift; ;;
        --) shift; break ;;
      esac
    done
  fi
  if [[ ${_need_help} == "true" ]]; then
    echo ""
    usage
    exit 0
  elif [[ "${#_env_files[@]}" -gt 1 ]]; then
    echo ""
    echo "Invalid usage: ${_args[*]}"
    echo "Ambiguous env file: ${_args[*]}"
    usage
    exit 1
  elif [[ "${#_env_files[@]}" -eq 1 ]]; then
    env_file="${_env_files[0]}"
  fi
}

function load_env() {
  # Save pre-existing environment variables
  local _saved_mdx_data_dir="${MDX_DATA_DIR}"
  local _saved_mdx_sample_apps_dir="${MDX_SAMPLE_APPS_DIR}"

  if [[ -f "${env_file}" ]]; then
    source "${env_file}"
    echo "✅ Sourced env file: ${env_file}"

    # Restore pre-existing environment variables if they were set
    if [[ -n "${_saved_mdx_data_dir}" ]]; then
      export MDX_DATA_DIR="${_saved_mdx_data_dir}"
      echo "Using pre-set exported vars MDX_DATA_DIR: ${MDX_DATA_DIR}"
    fi
    if [[ -n "${_saved_mdx_sample_apps_dir}" ]]; then
      export MDX_SAMPLE_APPS_DIR="${_saved_mdx_sample_apps_dir}"
      echo "Using pre-set exported vars MDX_SAMPLE_APPS_DIR: ${MDX_SAMPLE_APPS_DIR}"
    fi
  else
    echo "Error: env file '${env_file}' not found"
    exit 1
  fi
}

function info() {
  if [[ -d "${MDX_DATA_DIR}" ]]; then
    echo "Assuming the path of the MDX data dir as: ${MDX_DATA_DIR}"
    if [ "${delete_calibration_data}" == false ]; then
      echo "Calibration data will not be deleted"
    fi
    if [ "${delete_vst_data}" == false ]; then
      echo "VST data will not be deleted"
    fi
  else
    echo "Error: MDX data dir '${MDX_DATA_DIR}' not found"
  fi
}

function cleanup() {
  local _vst_volume _nvstreamer_volume

  if [ -d "${MDX_DATA_DIR}/data_log/kafka" ]; then
    sudo rm -rf ${MDX_DATA_DIR}/data_log/kafka/*
  fi

  if [ -d "${MDX_DATA_DIR}/data_log/elastic/data" ]; then
    sudo rm -rf ${MDX_DATA_DIR}/data_log/elastic/data/*
  fi

  if [ -d "${MDX_DATA_DIR}/data_log/elastic/logs" ]; then
    sudo rm -rf ${MDX_DATA_DIR}/data_log/elastic/logs/*
  fi

  if [ -d "${MDX_DATA_DIR}/data_log/behavior_learning_data" ]; then
    sudo rm -rf ${MDX_DATA_DIR}/data_log/behavior_learning_data/*
  fi

  if [ -d "${MDX_DATA_DIR}/data_log/vss_video_analytics_api/" ]; then
    sudo rm -rf ${MDX_DATA_DIR}/data_log/vss_video_analytics_api/*
  fi

  if [ -d "${MDX_DATA_DIR}/data_log/redis/data" ]; then
      sudo rm -rf ${MDX_DATA_DIR}/data_log/redis/data/*
  fi

  if [ -d "${MDX_DATA_DIR}/data_log/redis/log" ]; then
      sudo rm -rf ${MDX_DATA_DIR}/data_log/redis/log/*
  fi

  if [[ "${delete_calibration_data}" == true ]]; then
      sudo rm -rf ${MDX_DATA_DIR}/data_log/calibration_toolkit/*
  fi

  if [[ "${delete_vst_data}" == true ]]; then
      _vst_volume="${MDX_DATA_DIR}/data_log/vst"

      if [ -d "${_vst_volume}" ]; then
          sudo rm -rf "${_vst_volume}"
      fi

      _nvstreamer_volume="${MDX_DATA_DIR}/data_log/nvstreamer"

      if [ -d "${_nvstreamer_volume}" ]; then
          sudo rm -rf "${_nvstreamer_volume}"
      fi
  fi
}

process_args "${@}"
load_env
info
cleanup