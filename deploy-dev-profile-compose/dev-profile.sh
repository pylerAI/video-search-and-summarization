#!/bin/bash

script_dir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Default values
desired_state=""
profile=""
deployment_directory="${script_dir}"
data_directory="${script_dir}/data-dir"
hardware_profile="H100"
host_ip="$(ip route get 1.1.1.1 | awk '/src/ {for (i=1;i<=NF;i++) if ($i=="src") print $(i+1)}')"
externally_accessible_ip=""
mode=""
ngc_cli_api_key="${NGC_CLI_API_KEY:-}"
nvidia_api_key=""
dry_run="false"

# NIM-related defaults
# LLM configuration
llm_mode="local_shared"
llm=""
llm_device_id=""
llm_base_url=""

# VLM configuration
vlm_mode="local_shared"
vlm=""
vlm_device_id=""
vlm_base_url=""
vlm_custom_weights=""


# Flags to track explicitly provided options
options_provided=()

# LLM/VLM slug to name mapping
function get_llm_name() {
  local _slug="${1}"
  case "${_slug}" in
    nvidia-nemotron-nano-9b-v2) echo "nvidia/nvidia-nemotron-nano-9b-v2" ;;
    nemotron-3-nano) echo "nvidia/nemotron-3-nano" ;;
    llama-3.3-nemotron-super-49b-v1.5) echo "nvidia/llama-3.3-nemotron-super-49b-v1.5" ;;
    gpt-oss-20b) echo "openai/gpt-oss-20b" ;;
    *) echo "" ;;
  esac
}

function get_vlm_name() {
  local _slug="${1}"
  case "${_slug}" in
    cosmos-reason1-7b) echo "nvidia/cosmos-reason1-7b" ;;
    cosmos-reason2-8b) echo "nvidia/cosmos-reason2-8b" ;;
    qwen3-vl-8b-instruct) echo "Qwen/Qwen3-VL-8B-Instruct" ;;
    *) echo "" ;;
  esac
}

# Gets model name from remote API endpoint (works for both LLM and VLM)
# Arguments: base_url (e.g., http://localhost:30082/v1)
# Returns: model name from the /models endpoint, or empty string on error
function get_remote_model_name() {
  local _base_url="${1}"
  local _model_name _curl_exit_code
  
  _model_name="$(curl -s -f "${_base_url}/v1/models" 2>/dev/null | jq -r '.data[0].id // empty' 2>/dev/null)"
  _curl_exit_code=$?
  
  if [[ ${_curl_exit_code} -ne 0 ]] || [[ -z "${_model_name}" ]]; then
    echo "[WARNING] Failed to retrieve model name from ${_base_url}/v1/models" >&2
    echo ""
    return 1
  fi
  
  echo "${_model_name}"
  return 0
}

# Returns custom weights configuration for VLMs that require them
# Output format: ngc_resource|tar_file|extracted_dir
# Note: download_dir is derived from ngc_resource as <resource_name>_v<tag>
# Returns empty string if VLM doesn't require custom weights
function get_vlm_custom_weights_config() {
  local _slug="${1}"
  case "${_slug}" in
    # Add VLMs here as needed:
    # example-vlm)
    #   echo "org/team/resource:tag|tar_file.tar.gz|extracted_dir"
    #   ;;
    *)
      echo ""
      ;;
  esac
}

# Downloads and installs VLM custom weights from NGC
# Arguments: vlm_slug, ngc_api_key, weights_base_dir, dry_run
# Returns: path to installed weights directory (via _vlm_custom_weights_result variable)
function download_vlm_custom_weights() {
  local _vlm_slug="${1}"
  local _ngc_api_key="${2}"
  local _weights_base_dir="${3}"
  local _dry_run="${4}"

  local _config
  _config="$(get_vlm_custom_weights_config "${_vlm_slug}")"

  if [[ -z "${_config}" ]]; then
    _vlm_custom_weights_result=""
    return 1
  fi

  # Parse config (format: ngc_resource|tar_file|extracted_dir)
  local _ngc_resource _tar_file _extracted_dir
  IFS='|' read -r _ngc_resource _tar_file _extracted_dir <<< "${_config}"

  # Derive download_dir from ngc_resource (NGC CLI creates <resource_name>_v<tag>)
  local _resource_name _resource_tag _download_dir
  _resource_name="${_ngc_resource##*/}"  # Get last part after /
  _resource_name="${_resource_name%:*}"  # Remove tag (part after :)
  _resource_tag="${_ngc_resource##*:}"   # Get tag (part after :)
  _download_dir="${_resource_name}_v${_resource_tag}"

  local _tar_path="${_download_dir}/${_tar_file}"
  local _final_path="${_weights_base_dir}/${_extracted_dir}"

  echo "[INFO] Setting up custom weights for ${_vlm_slug} VLM..."

  if [[ "${_dry_run}" == "true" ]]; then
    echo "[DRY-RUN] mkdir -p ${_weights_base_dir}"
    echo "[DRY-RUN] NGC_CLI_API_KEY=<ngc-cli-api-key> ngc registry resource download-version ${_ngc_resource}"
    echo "[DRY-RUN] tar -xzf ${_tar_path}"
    echo "[DRY-RUN] mv ${_extracted_dir} ${_weights_base_dir}/"
    echo "[DRY-RUN] rm -rf ${_download_dir}"
    _vlm_custom_weights_result="${_final_path}"
    return 0
  fi

  # Create weights directory if not exists
  mkdir -p "${_weights_base_dir}"

  # Only download if the weights don't already exist
  if [[ ! -d "${_final_path}" ]]; then
    echo "[INFO] Downloading custom weights from NGC..."
    NGC_CLI_API_KEY="${_ngc_api_key}" ngc \
      registry \
      resource \
      download-version \
      "${_ngc_resource}"

    echo "[INFO] Extracting custom weights..."
    tar -xzf "${_tar_path}"

    echo "[INFO] Moving extracted weights to ${_weights_base_dir}..."
    mv "${_extracted_dir}" "${_weights_base_dir}/"

    echo "[INFO] Cleaning up download directory..."
    rm -rf "${_download_dir}"

    echo "[INFO] Custom weights installed to ${_final_path}"
  else
    echo "[INFO] Custom weights already exist at ${_final_path}, skipping download"
  fi

  _vlm_custom_weights_result="${_final_path}"
  return 0
}

function get_env_value() {
  local _env_file="${1}"
  local _var_name="${2}"
  if [[ -f "${_env_file}" ]]; then
    grep "^${_var_name}=" "${_env_file}" 2>/dev/null | cut -d'=' -f2- | head -1
  fi
}

function mask_secret() {
  local _secret="${1}"
  local _len="${#_secret}"
  if [[ ${_len} -le 6 ]]; then
    echo "******"
  else
    local _first="${_secret:0:3}"
    local _last="${_secret: -3}"
    local _middle_len=$((_len - 6))
    local _mask=$(printf '%*s' "${_middle_len}" '' | tr ' ' '*')
    echo "${_first}${_mask}${_last}"
  fi
}

function usage() {
  echo "Usage: ${0} (up|down) [options]"
  echo "   or: ${0} (-h|--help)"
  echo ""
  echo "Positional arguments:"
  echo "  desired-state                    up or down"
  echo ""
  echo "Options for 'up':"
  echo "  -p, --profile                    one of base, lvs, search, alerts (required)"
  echo "  -H, --hardware-profile           hardware profile: H100, L40S, RTX6000PROBW"
  echo "                                   (default: H100)"
  echo "  -i, --host-ip                    host IP (default: primary IP from ip route)"
  echo "  -e, --externally-accessible-ip   externally accessible IP (optional)"
  echo "  -m, --mode                       mode, only for alerts: 2d_cv or 2d_vlm"
  echo "  -k, --ngc-cli-api-key            NGC CLI API key (required, or set NGC_CLI_API_KEY env var)"
  echo ""
  echo "LLM Configuration:"
  echo "  --llm-mode                       LLM mode: local_shared, local, or remote (default: local_shared)"
  echo "                                   Constraint: both llm-mode and vlm-mode must be local_shared, or neither"
  echo "  --llm                            LLM model: nvidia-nemotron-nano-9b-v2, nemotron-3-nano,"
  echo "                                   llama-3.3-nemotron-super-49b-v1.5, gpt-oss-20b"
  echo "                                   Not allowed if LLM_MODE=remote (model name retrieved from API)"
  echo "  --llm-device-id                  LLM device ID (optional, not allowed if LLM_MODE=remote)"
  echo "  --llm-base-url                   LLM base URL (required if LLM_MODE=remote)"
  echo "  --nvidia-api-key                 NVIDIA API key (optional, only allowed if LLM_MODE=remote)"
  echo ""
  echo "VLM Configuration:"
  echo "  --vlm-mode                       VLM mode: local_shared, local, or remote (default: local_shared)"
  echo "                                   Constraint: both llm-mode and vlm-mode must be local_shared, or neither"
  echo "  --vlm                            VLM model: cosmos-reason1-7b, cosmos-reason2-8b, qwen3-vl-8b-instruct"
  echo "                                   Not allowed for profile=search"
  echo "                                   Not allowed if VLM_MODE=remote (model name retrieved from API)"
  echo "  --vlm-device-id                  VLM device ID (optional)"
  echo "                                   Not allowed if VLM_MODE=local_shared/remote or profile=search"
  echo "  --vlm-base-url                   VLM base URL (required if VLM_MODE=remote, except search)"
  echo "                                   Not allowed for profile=search"
  echo "  --vlm-custom-weights             Path to custom VLM weights directory, or 'None' (optional)"
  echo "                                   If path provided, uses that instead of default weights"
  echo "                                   If 'None', skips custom weights entirely (no download, no env set)"
  echo "                                   Not allowed if VLM_MODE=remote or profile=search"
  echo ""
  echo "Options for 'up' and 'down':"
  echo "  -d, --dry-run                    print commands without executing them"
  echo "  -h, --help                       show this help message"
}

function contains_element() {
  local _element _ref_array _array_element
  _element="${1}"
  _ref_array=("${@:2}")
  for _array_element in "${_ref_array[@]}"
  do
    if [[ "${_element}" == "${_array_element}" ]]; then
      return 0
    fi
  done
  return 1
}

function validate_args() {
  local _args _valid_args _valid_desired_states _valid_profiles _valid_modes _all_good
  _args=("${@}")
  _all_good=0

  _valid_args=$(getopt -q -o p:H:i:e:m:k:dh --long profile:,hardware-profile:,host-ip:,externally-accessible-ip:,mode:,ngc-cli-api-key:,nvidia-api-key:,llm-mode:,vlm-mode:,llm-device-id:,vlm-device-id:,llm-base-url:,vlm-base-url:,llm:,vlm:,vlm-custom-weights:,dry-run,help -- "${_args[@]}")
  if [[ $? -ne 0 ]]; then
    echo "[ERROR] Invalid usage: ${_args[*]}"
    ((_all_good++))
  else
    eval set -- "${_valid_args}"

    # Check for help flag first
    while true; do
      case "${1}" in
        -h | --help) usage; exit 0 ;;
        --) shift; break ;;
        *) shift ;;
      esac
    done

    # Get positional argument (desired-state)
    if [[ -z "${1}" ]]; then
      echo "[ERROR] desired-state is required"
      ((_all_good++))
    else
      _valid_desired_states=('up' 'down')
      if ! contains_element "${1}" "${_valid_desired_states[@]}"; then
        echo "[ERROR] Invalid desired-state: ${1}. Must be 'up' or 'down'"
        ((_all_good++))
      fi
    fi
  fi

  if [[ _all_good -gt 0 ]]; then
    echo ""
    usage
    exit 1
  fi
}

function process_args() {
  local _args _valid_args _valid_profiles _valid_modes _all_good
  _args=("${@}")
  _all_good=0

  _valid_args=$(getopt -q -o p:H:i:e:m:k:dh --long profile:,hardware-profile:,host-ip:,externally-accessible-ip:,mode:,ngc-cli-api-key:,nvidia-api-key:,llm-mode:,vlm-mode:,llm-device-id:,vlm-device-id:,llm-base-url:,vlm-base-url:,llm:,vlm:,vlm-custom-weights:,dry-run,help -- "${_args[@]}")
  eval set -- "${_valid_args}"

  # Parse options
  while true; do
    case "${1}" in
      -p | --profile)
        shift
        profile="${1}"
        options_provided+=("profile")
        shift
        ;;
      -H | --hardware-profile)
        shift
        hardware_profile="${1}"
        options_provided+=("hardware-profile")
        shift
        ;;
      -i | --host-ip)
        shift
        host_ip="${1}"
        options_provided+=("host-ip")
        shift
        ;;
      -e | --externally-accessible-ip)
        shift
        externally_accessible_ip="${1}"
        options_provided+=("externally-accessible-ip")
        shift
        ;;
      -m | --mode)
        shift
        mode="${1}"
        options_provided+=("mode")
        shift
        ;;
      -k | --ngc-cli-api-key)
        shift
        ngc_cli_api_key="${1}"
        options_provided+=("ngc-cli-api-key")
        shift
        ;;
      --nvidia-api-key)
        shift
        nvidia_api_key="${1}"
        options_provided+=("nvidia-api-key")
        shift
        ;;
      --llm-mode)
        shift
        llm_mode="${1}"
        options_provided+=("llm-mode")
        shift
        ;;
      --vlm-mode)
        shift
        vlm_mode="${1}"
        options_provided+=("vlm-mode")
        shift
        ;;
      --llm-device-id)
        shift
        llm_device_id="${1}"
        options_provided+=("llm-device-id")
        shift
        ;;
      --vlm-device-id)
        shift
        vlm_device_id="${1}"
        options_provided+=("vlm-device-id")
        shift
        ;;
      --llm-base-url)
        shift
        llm_base_url="${1}"
        options_provided+=("llm-base-url")
        shift
        ;;
      --vlm-base-url)
        shift
        vlm_base_url="${1}"
        options_provided+=("vlm-base-url")
        shift
        ;;
      --llm)
        shift
        llm="${1}"
        options_provided+=("llm")
        shift
        ;;
      --vlm)
        shift
        vlm="${1}"
        options_provided+=("vlm")
        shift
        ;;
      --vlm-custom-weights)
        shift
        vlm_custom_weights="${1}"
        options_provided+=("vlm-custom-weights")
        shift
        ;;
      -d | --dry-run)
        dry_run="true"
        options_provided+=("dry-run")
        shift
        ;;
      -h | --help)
        shift
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  # Get positional argument
  desired_state="${1}"

  # Validation based on desired-state
  if [[ "${desired_state}" == "down" ]]; then
    # Only dry-run option is allowed for 'down'
    for _opt in "${options_provided[@]}"; do
      if [[ "${_opt}" != "dry-run" ]]; then
        echo "[ERROR] Only --dry-run option is allowed for desired-state 'down'"
        echo "[ERROR] Invalid option provided: ${_opt}"
        ((_all_good++))
        break
      fi
    done
  elif [[ "${desired_state}" == "up" ]]; then
    # Validate required options for 'up'
    if ! contains_element "profile" "${options_provided[@]}"; then
      echo "[ERROR] --profile is required for desired-state 'up'"
      ((_all_good++))
    fi
    if [[ -z "${ngc_cli_api_key}" ]]; then
      echo "[ERROR] --ngc-cli-api-key is required for desired-state 'up' (or set NGC_CLI_API_KEY env var)"
      ((_all_good++))
    fi

    # Validate profile value
    if [[ -n "${profile}" ]]; then
      _valid_profiles=('base' 'lvs' 'search' 'alerts')
      if ! contains_element "${profile}" "${_valid_profiles[@]}"; then
        echo "[ERROR] Invalid profile: ${profile}. Must be one of: base, lvs, search, alerts"
        ((_all_good++))
      fi
    fi

    # Validate hardware profile value
    _valid_hardware_profiles=('H100' 'L40S' 'RTX6000PROBW')
    if ! contains_element "${hardware_profile}" "${_valid_hardware_profiles[@]}"; then
      echo "[ERROR] Invalid hardware-profile: ${hardware_profile}. Must be one of: H100, L40S, RTX6000PROBW"
      ((_all_good++))
    fi

    # Validate NIM compatibility with hardware profiles
    # L40S supports local or remote, but not local_shared (except for search profile)
    if [[ "${hardware_profile}" == "L40S" ]]; then
      if [[ "${llm_mode}" == "local_shared" ]] && [[ "${profile}" != "search" ]]; then
        echo "[ERROR] Hardware profile 'L40S' does not support LLM_MODE=local_shared for profile '${profile}'. Use LLM_MODE=local or LLM_MODE=remote instead"
        ((_all_good++))
      fi
      if [[ "${vlm_mode}" == "local_shared" ]] && [[ "${profile}" != "search" ]]; then
        echo "[ERROR] Hardware profile 'L40S' does not support VLM_MODE=local_shared for profile '${profile}'. Use VLM_MODE=local or VLM_MODE=remote instead"
        ((_all_good++))
      fi
    fi

    # Validate mode based on profile
    if [[ "${profile}" == "alerts" ]]; then
      if contains_element "mode" "${options_provided[@]}"; then
        _valid_modes=('2d_cv' '2d_vlm')
        if ! contains_element "${mode}" "${_valid_modes[@]}"; then
          echo "[ERROR] Invalid mode: ${mode}. For alerts profile, must be one of: 2d_cv, 2d_vlm"
          ((_all_good++))
        fi
      fi
    else
      # For non-alert profiles, mode option is not allowed
      if contains_element "mode" "${options_provided[@]}"; then
        echo "[ERROR] --mode is only accepted when profile is 'alerts'"
        ((_all_good++))
      fi
    fi

    # Validate LLM_MODE and VLM_MODE values
    _valid_mode_values=('local_shared' 'local' 'remote')
    if ! contains_element "${llm_mode}" "${_valid_mode_values[@]}"; then
      echo "[ERROR] Invalid LLM_MODE value: ${llm_mode}. Must be one of: local_shared, local, remote"
      ((_all_good++))
    fi
    if ! contains_element "${vlm_mode}" "${_valid_mode_values[@]}"; then
      echo "[ERROR] Invalid VLM_MODE value: ${vlm_mode}. Must be one of: local_shared, local, remote"
      ((_all_good++))
    fi

    # Validate constraint: both llm_mode and vlm_mode must be local_shared, or neither
    if [[ "${llm_mode}" == "local_shared" ]] && [[ "${vlm_mode}" != "local_shared" ]]; then
      echo "[ERROR] If LLM_MODE is local_shared, VLM_MODE must also be local_shared"
      ((_all_good++))
    fi
    if [[ "${llm_mode}" != "local_shared" ]] && [[ "${vlm_mode}" == "local_shared" ]]; then
      echo "[ERROR] If VLM_MODE is local_shared, LLM_MODE must also be local_shared"
      ((_all_good++))
    fi

    # ===== LLM Validations =====
    
    # Validate LLM_MODE-related options
    if [[ "${llm_mode}" == "remote" ]]; then
      # LLM slug should not be provided for remote (model name comes from API)
      if contains_element "llm" "${options_provided[@]}"; then
        echo "[ERROR] --llm is not allowed when LLM_MODE=remote (model name is retrieved from the remote API)"
        ((_all_good++))
      fi
      # LLM device ID should not be provided for remote
      if contains_element "llm-device-id" "${options_provided[@]}"; then
        echo "[ERROR] --llm-device-id is not allowed when LLM_MODE=remote"
        ((_all_good++))
      fi
      # LLM base URL is required for remote
      if [[ -z "${llm_base_url}" ]]; then
        echo "[ERROR] --llm-base-url is required when LLM_MODE=remote"
        ((_all_good++))
      fi
    else
      # Validate LLM slug if provided (only for non-remote modes)
      if contains_element "llm" "${options_provided[@]}"; then
        if [[ -z "$(get_llm_name "${llm}")" ]]; then
          echo "[ERROR] Invalid LLM: ${llm}. Must be one of: nvidia-nemotron-nano-9b-v2, nemotron-3-nano, llama-3.3-nemotron-super-49b-v1.5, gpt-oss-20b"
          ((_all_good++))
        fi
      fi
      # NVIDIA_API_KEY should only be provided for remote LLM_MODE
      if contains_element "nvidia-api-key" "${options_provided[@]}"; then
        echo "[ERROR] --nvidia-api-key is only allowed when LLM_MODE=remote"
        ((_all_good++))
      fi
    fi

    # ===== VLM Validations =====
    
    # Validate VLM options not allowed for search profile
    if [[ "${profile}" == "search" ]]; then
      if contains_element "vlm-device-id" "${options_provided[@]}"; then
        echo "[ERROR] --vlm-device-id is not allowed for search profile"
        ((_all_good++))
      fi
      if contains_element "vlm-base-url" "${options_provided[@]}"; then
        echo "[ERROR] --vlm-base-url is not allowed for search profile"
        ((_all_good++))
      fi
      if contains_element "vlm" "${options_provided[@]}"; then
        echo "[ERROR] --vlm is not allowed for search profile"
        ((_all_good++))
      fi
      if contains_element "vlm-custom-weights" "${options_provided[@]}"; then
        echo "[ERROR] --vlm-custom-weights is not allowed for search profile"
        ((_all_good++))
      fi
    fi

    # Validate VLM_MODE-related options
    if [[ "${vlm_mode}" == "remote" ]]; then
      # VLM slug should not be provided for remote (model name comes from API)
      if contains_element "vlm" "${options_provided[@]}"; then
        echo "[ERROR] --vlm is not allowed when VLM_MODE=remote (model name is retrieved from the remote API)"
        ((_all_good++))
      fi
      # VLM device ID should not be provided for remote
      if contains_element "vlm-device-id" "${options_provided[@]}"; then
        echo "[ERROR] --vlm-device-id is not allowed when VLM_MODE=remote"
        ((_all_good++))
      fi
      # Custom weights not needed for remote (VLM hosted remotely)
      if contains_element "vlm-custom-weights" "${options_provided[@]}"; then
        echo "[ERROR] --vlm-custom-weights is not allowed when VLM_MODE=remote"
        ((_all_good++))
      fi
      # VLM base URL required for remote, except for search profile
      if [[ -z "${vlm_base_url}" ]] && [[ "${profile}" != "search" ]]; then
        echo "[ERROR] --vlm-base-url is required when VLM_MODE=remote"
        ((_all_good++))
      fi
    else
      # For local_shared and local modes: validate VLM slug if provided
      if contains_element "vlm" "${options_provided[@]}"; then
        if [[ -z "$(get_vlm_name "${vlm}")" ]]; then
          echo "[ERROR] Invalid VLM: ${vlm}. Must be one of: cosmos-reason1-7b, cosmos-reason2-8b, qwen3-vl-8b-instruct"
          ((_all_good++))
        fi
      fi
      
      # VLM device ID should not be provided for local_shared
      if [[ "${vlm_mode}" == "local_shared" ]]; then
        if contains_element "vlm-device-id" "${options_provided[@]}"; then
          echo "[ERROR] --vlm-device-id is not allowed when VLM_MODE=local_shared"
          ((_all_good++))
        fi
      fi
    fi

  fi

  if [[ _all_good -gt 0 ]]; then
    echo ""
    usage
    exit 1
  fi
}

function print_args() {
  echo "=== Captured Arguments ==="
  echo "desired-state:        ${desired_state}"
  echo "profile:              ${profile}"
  echo "deployment-directory: ${deployment_directory}"
  echo "data-directory:       ${data_directory}"
  echo "hardware-profile:     ${hardware_profile}"
  echo "host-ip:              ${host_ip}"
  if [[ -n "${externally_accessible_ip}" ]]; then
    echo "externally-accessible-ip: ${externally_accessible_ip}"
  fi
  if [[ "${desired_state}" == "up" ]] && [[ "${profile}" == "alerts" ]]; then
    local _env_file_for_mode="${deployment_directory}/developer-workflow/dev-profile-${profile}/.env"
    local _mode_display="${mode:-$(get_env_value "${_env_file_for_mode}" "MODE")}"
    echo "mode:                 ${_mode_display}"
  fi
  echo "ngc-cli-api-key:      $(mask_secret "${ngc_cli_api_key}")"
  echo "dry-run:              ${dry_run}"
  if [[ "${desired_state}" == "up" ]]; then
    local _env_file="${deployment_directory}/developer-workflow/dev-profile-${profile}/.env"
    local _display_value

    echo "--- LLM Config ---"
    echo "llm-mode:             ${llm_mode}"
    
    # LLM model: always applicable
    if [[ "${llm_mode}" == "remote" ]] && [[ -n "${llm_base_url}" ]]; then
      _display_value="$(get_remote_model_name "${llm_base_url}")"
    else
      _display_value="${llm:-$(get_env_value "${_env_file}" "LLM_NAME_SLUG")}"
    fi
    echo "llm:                  ${_display_value}"

    # LLM device ID: applicable for local_shared and local (not remote)
    if [[ "${llm_mode}" != "remote" ]]; then
      _display_value="${llm_device_id:-$(get_env_value "${_env_file}" "LLM_DEVICE_ID")}"
      echo "llm-device-id:        ${_display_value}"
    fi

    # LLM base URL: applicable for remote
    if [[ "${llm_mode}" == "remote" ]]; then
      _display_value="${llm_base_url:-$(get_env_value "${_env_file}" "LLM_BASE_URL")}"
      echo "llm-base-url:         ${_display_value}"
      # NVIDIA API key: applicable for remote
      if [[ -n "${nvidia_api_key}" ]]; then
        echo "nvidia-api-key:       $(mask_secret "${nvidia_api_key}")"
      fi
    fi

    # VLM configuration: not applicable for search profile
    if [[ "${profile}" != "search" ]]; then
      echo "--- VLM Config ---"
      echo "vlm-mode:             ${vlm_mode}"
      
      # VLM model
      if [[ "${vlm_mode}" == "remote" ]] && [[ -n "${vlm_base_url}" ]]; then
        _display_value="$(get_remote_model_name "${vlm_base_url}")"
      else
        _display_value="${vlm:-$(get_env_value "${_env_file}" "VLM_NAME_SLUG")}"
      fi
      echo "vlm:                  ${_display_value}"

      # VLM device ID: applicable for local only (not local_shared, not remote)
      if [[ "${vlm_mode}" == "local" ]]; then
        _display_value="${vlm_device_id:-$(get_env_value "${_env_file}" "VLM_DEVICE_ID")}"
        echo "vlm-device-id:        ${_display_value}"
      fi

      # VLM base URL: applicable for remote
      if [[ "${vlm_mode}" == "remote" ]]; then
        _display_value="${vlm_base_url:-$(get_env_value "${_env_file}" "VLM_BASE_URL")}"
        echo "vlm-base-url:         ${_display_value}"
      fi

      # VLM custom weights: show if provided
      if [[ -n "${vlm_custom_weights}" ]]; then
        echo "vlm-custom-weights:   ${vlm_custom_weights}"
      fi
    fi
  fi
  echo "=========================="
}

function state_up() {
  local _profile_dir _source_env _generated_env
  _profile_dir="${deployment_directory}/developer-workflow/dev-profile-${profile}"
  _source_env="${_profile_dir}/.env"
  _generated_env="${_profile_dir}/generated.env"

  echo "[INFO] Generating environment file for profile '${profile}'..."

  # Check if source .env exists
  if [[ ! -f "${_source_env}" ]]; then
    echo "[ERROR] Source .env file not found: ${_source_env}"
    exit 1
  fi

  # Copy source .env to generated.env
  cp "${_source_env}" "${_generated_env}"
  echo "[INFO] Copied ${_source_env} to ${_generated_env}"

  # Function to set or update a variable in the generated.env
  # Usage: set_env_var <var_name> <var_value> [mask]
  # If mask is "true", the value will be masked in the output
  # This function will uncomment and update commented variables (e.g., #VAR=value)
  set_env_var() {
    local var_name="${1}"
    local var_value="${2}"
    local mask="${3:-false}"
    local display_value="${var_value}"
    if [[ "${mask}" == "true" ]]; then
      display_value="$(mask_secret "${var_value}")"
    fi
    if grep -q "^${var_name}=" "${_generated_env}"; then
      # Variable exists (uncommented), update it
      sed -i "s|^${var_name}=.*|${var_name}=${var_value}|" "${_generated_env}"
    elif grep -Eq "^#[[:space:]]*${var_name}=" "${_generated_env}"; then
      # Variable exists but is commented (with optional whitespace), uncomment and update it
      sed -i -E "s|^#[[:space:]]*${var_name}=.*|${var_name}=${var_value}|" "${_generated_env}"
    else
      # Variable doesn't exist, append it
      echo "${var_name}=${var_value}" >> "${_generated_env}"
    fi
    echo "[INFO] Set ${var_name}=${display_value}"
  }

  # Set the required environment variables
  set_env_var "MDX_SAMPLE_APPS_DIR" "${deployment_directory}"
  set_env_var "MDX_DATA_DIR" "${data_directory}"
  set_env_var "HOST_IP" "${host_ip}"
  if [[ -n "${externally_accessible_ip}" ]]; then
    set_env_var "EXTERNALLY_ACCESSIBLE_IP" "${externally_accessible_ip}"
  fi
  set_env_var "NGC_CLI_API_KEY" "${ngc_cli_api_key}" "true"
  set_env_var "HARDWARE_PROFILE" "${hardware_profile}"
  if [[ -n "${mode}" ]]; then
    set_env_var "MODE" "${mode}"
  fi

  # ===== LLM Configuration =====
  set_env_var "LLM_MODE" "${llm_mode}"
  if [[ "${llm_mode}" == "remote" ]] && [[ -n "${llm_base_url}" ]]; then
    set_env_var "LLM_NAME" "$(get_remote_model_name "${llm_base_url}")"
    # Note: LLM_NAME_SLUG not set for remote mode - slug is for profile selection only
  elif [[ -n "${llm}" ]]; then
    set_env_var "LLM_NAME" "$(get_llm_name "${llm}")"
    set_env_var "LLM_NAME_SLUG" "${llm}"
  fi
  if [[ -n "${llm_device_id}" ]]; then
    set_env_var "LLM_DEVICE_ID" "${llm_device_id}"
  fi
  if [[ -n "${llm_base_url}" ]]; then
    set_env_var "LLM_BASE_URL" "${llm_base_url}"
  fi
  if [[ -n "${nvidia_api_key}" ]]; then
    set_env_var "NVIDIA_API_KEY" "${nvidia_api_key}" "true"
  fi

  # ===== VLM Configuration =====
  set_env_var "VLM_MODE" "${vlm_mode}"
  if [[ "${vlm_mode}" == "remote" ]] && [[ -n "${vlm_base_url}" ]]; then
    set_env_var "VLM_NAME" "$(get_remote_model_name "${vlm_base_url}")"
    # Note: VLM_NAME_SLUG not set for remote mode - slug is for profile selection only
  elif [[ -n "${vlm}" ]]; then
    set_env_var "VLM_NAME" "$(get_vlm_name "${vlm}")"
    set_env_var "VLM_NAME_SLUG" "${vlm}"
  fi
  if [[ -n "${vlm_device_id}" ]]; then
    set_env_var "VLM_DEVICE_ID" "${vlm_device_id}"
  fi
  if [[ -n "${vlm_base_url}" ]]; then
    set_env_var "VLM_BASE_URL" "${vlm_base_url}"
    set_env_var "RTVI_VLM_ENDPOINT" "${vlm_base_url}/v1"
    set_env_var "RTVI_VLM_MODEL_PATH" "none"
  fi

  # For local_shared/local VLM modes with 2d_vlm, configure rtvi-vlm to use the shared NIM endpoint
  if [[ "${profile}" == "alerts" ]] && [[ "${mode}" == "2d_vlm" ]] && [[ "${vlm_mode}" != "remote" ]]; then
    local _vlm_port
    _vlm_port="$(get_env_value "${_source_env}" "VLM_PORT")"
    _vlm_port="${_vlm_port:-30082}"
    set_env_var "RTVI_VLM_MODEL_PATH" "none"
    set_env_var "RTVI_VLM_ENDPOINT" "http://\${HOST_IP}:${_vlm_port}/v1"
    echo "[INFO] Configured rtvi-vlm to use shared NIM endpoint on port ${_vlm_port}"
  fi

  # Handle custom weights for VLM
  # Skip if: profile=search (no VLM needed) or vlm_mode=remote (VLM hosted remotely)
  if [[ "${profile}" == "search" ]]; then
    echo "[INFO] Skipping VLM custom weights - not required for search profile"
  elif [[ "${vlm_mode}" == "remote" ]]; then
    echo "[INFO] Skipping VLM custom weights - not required for remote VLM_MODE"
  else
    # User-provided path takes precedence; otherwise download defaults if VLM requires them
    local _vlm_to_check="${vlm:-$(get_env_value "${_source_env}" "VLM_NAME_SLUG")}"

    if [[ "${vlm_custom_weights}" == "None" ]]; then
      # User explicitly opted out of custom weights
      echo "[INFO] Skipping VLM custom weights - explicitly set to 'None'"
    elif [[ -n "${vlm_custom_weights}" ]]; then
      # User provided a custom weights path
      echo "[INFO] Using user-provided VLM custom weights path: ${vlm_custom_weights}"
      if [[ "${dry_run}" != "true" ]] && [[ ! -d "${vlm_custom_weights}" ]]; then
        echo "[ERROR] Specified VLM custom weights path does not exist: ${vlm_custom_weights}"
        exit 1
      fi
      set_env_var "VLM_CUSTOM_WEIGHTS" "${vlm_custom_weights}"
    elif [[ -n "$(get_vlm_custom_weights_config "${_vlm_to_check}")" ]]; then
      # VLM has default custom weights - download them
      local _vlm_weights_dir="${script_dir}/vlm-custom-weights"
      if download_vlm_custom_weights "${_vlm_to_check}" "${ngc_cli_api_key}" "${_vlm_weights_dir}" "${dry_run}"; then
        set_env_var "VLM_CUSTOM_WEIGHTS" "${_vlm_custom_weights_result}"
      fi
    fi
  fi

  echo "[INFO] Generated environment file: ${_generated_env}"

  # Create required directories
  echo "[INFO] Creating data directories..."
  mkdir -p "${data_directory}/data_log/analytics_cache"
  mkdir -p "${data_directory}/data_log/calibration_toolkit"
  mkdir -p "${data_directory}/data_log/elastic/data"
  mkdir -p "${data_directory}/data_log/elastic/logs"
  mkdir -p "${data_directory}/data_log/kafka"
  mkdir -p "${data_directory}/data_log/redis/data"
  mkdir -p "${data_directory}/data_log/redis/log"

  # Create alerts-specific directories and download models
  if [[ "${profile}" == "alerts" ]]; then
    echo "[INFO] Creating alerts-specific directories..."
    mkdir -p "${data_directory}/data_log/vss_video_analytics_api"
    mkdir -p "${data_directory}/videos/dev-profile-alerts"

    # Download alerts models from NGC
    echo "[INFO] Downloading alerts models from NGC..."

    if [[ "${dry_run}" == "true" ]]; then
      echo "[DRY-RUN] rm -rf ${data_directory}/models"
      echo "[DRY-RUN] mkdir -p ${data_directory}/models/rtdetr-its"
      echo "[DRY-RUN] mkdir -p ${data_directory}/models/gdino"
      echo "[DRY-RUN] NGC_CLI_API_KEY=<ngc-cli-api-key> ngc registry model download-version nvidia/tao/trafficcamnet_transformer_lite:deployable_resnet50_v2.0"
      echo "[DRY-RUN] mv trafficcamnet_transformer_lite_vdeployable_resnet50_v2.0/resnet50_trafficcamnet_rtdetr.fp16.onnx ${data_directory}/models/rtdetr-its/model_epoch_035.fp16.onnx"
      echo "[DRY-RUN] rm -rf trafficcamnet_transformer_lite_vdeployable_resnet50_v2.0"
      echo "[DRY-RUN] NGC_CLI_API_KEY=<ngc-cli-api-key> ngc registry model download-version nvidia/tao/grounding_dino:grounding_dino_swin_tiny_commercial_deployable_v1.0"
      echo "[DRY-RUN] mv grounding_dino_vgrounding_dino_swin_tiny_commercial_deployable_v1.0/grounding_dino_swin_tiny_commercial_deployable.onnx ${data_directory}/models/gdino/grounding_dino_swin_tiny_commercial_deployable.onnx"
      echo "[DRY-RUN] rm -rf grounding_dino_vgrounding_dino_swin_tiny_commercial_deployable_v1.0"
      echo "[DRY-RUN] chmod -R 777 ${data_directory}/models"
    else
      rm -rf "${data_directory}/models"

      mkdir -p "${data_directory}/models/rtdetr-its"
      mkdir -p "${data_directory}/models/gdino"

      # Download and install trafficcamnet RT-DETR model
      NGC_CLI_API_KEY="${ngc_cli_api_key}" ngc \
        registry \
        model \
        download-version \
        nvidia/tao/trafficcamnet_transformer_lite:deployable_resnet50_v2.0

      mv trafficcamnet_transformer_lite_vdeployable_resnet50_v2.0/resnet50_trafficcamnet_rtdetr.fp16.onnx \
        "${data_directory}/models/rtdetr-its/model_epoch_035.fp16.onnx"

      rm -rf trafficcamnet_transformer_lite_vdeployable_resnet50_v2.0

      # Download and install grounding DINO model
      NGC_CLI_API_KEY="${ngc_cli_api_key}" ngc \
        registry \
        model \
        download-version \
        nvidia/tao/grounding_dino:grounding_dino_swin_tiny_commercial_deployable_v1.0

      mv grounding_dino_vgrounding_dino_swin_tiny_commercial_deployable_v1.0/grounding_dino_swin_tiny_commercial_deployable.onnx \
        "${data_directory}/models/gdino/grounding_dino_swin_tiny_commercial_deployable.onnx"

      rm -rf grounding_dino_vgrounding_dino_swin_tiny_commercial_deployable_v1.0

      chmod -R 777 "${data_directory}/models"
      echo "[INFO] Alerts models downloaded and installed to ${data_directory}/models"
    fi
  fi

  # Set permissions on data_log directory
  echo "[INFO] Setting permissions on data_log directory..."
  chmod -R 777 "${data_directory}/data_log"

  # Docker login to nvcr.io
  echo "[INFO] Logging into nvcr.io..."
  if [[ "${dry_run}" == "true" ]]; then
    echo "[DRY-RUN] docker login --username '\$oauthtoken' --password <ngc-cli-api-key> nvcr.io"
  else
    docker login \
      --username '$oauthtoken' \
      --password "${ngc_cli_api_key}" \
      nvcr.io
  fi

  # Docker compose up
  echo "[INFO] Starting docker compose..."
  if [[ "${dry_run}" == "true" ]]; then
    echo "[DRY-RUN] cd ${deployment_directory} && docker compose --env-file developer-workflow/dev-profile-${profile}/generated.env up --detach --force-recreate --build"
  else
    cd "${deployment_directory}" && docker compose \
      --env-file "developer-workflow/dev-profile-${profile}/generated.env" \
      up \
      --detach \
      --force-recreate \
      --build
  fi

  echo "[INFO] State up completed"
}

function state_down() {
  local _profile_dir_names _profile_dir_name _generated_env

  echo "[INFO] Cleaning up generated.env files from all profiles..."
  _profile_dir_names=('base' 'lvs' 'search' 'alerts')
  for _profile_dir_name in "${_profile_dir_names[@]}"; do
    _generated_env="${deployment_directory}/developer-workflow/dev-profile-${_profile_dir_name}/generated.env"
    if [[ -f "${_generated_env}" ]]; then
      if [[ "${dry_run}" == "true" ]]; then
        echo "[DRY-RUN] rm -f ${_generated_env}"
      else
        rm -f "${_generated_env}"
        echo "[INFO] Deleted ${_generated_env}"
      fi
    fi
  done

  echo "[INFO] Bringing down docker compose project 'mdx'..."
  if [[ "${dry_run}" == "true" ]]; then
    echo "[DRY-RUN] docker compose -p mdx down"
  else
    docker compose -p mdx down
  fi

  echo "[INFO] Removing dangling docker volumes..."
  if [[ "${dry_run}" == "true" ]]; then
    echo "[DRY-RUN] docker volume ls -q -f \"dangling=true\" | xargs docker volume rm"
  else
    dangling_volumes=$(docker volume ls -q -f "dangling=true")
    if [[ -n "${dangling_volumes}" ]]; then
      echo "${dangling_volumes}" | xargs docker volume rm
    else
      echo "[INFO] No dangling volumes to remove"
    fi
  fi

  echo "[INFO] Deleting data directory: ${data_directory}..."
  if [[ "${dry_run}" == "true" ]]; then
    echo "[DRY-RUN] sudo rm -rf ${data_directory}"
  else
    if [[ -d "${data_directory}" ]]; then
      sudo rm -rf "${data_directory}"
      echo "[INFO] Data directory deleted"
    else
      echo "[INFO] Data directory does not exist, skipping"
    fi
  fi

  echo "[INFO] State down completed"
}

# Main execution
validate_args "${@}"
process_args "${@}"
print_args

if [[ "${desired_state}" == "up" ]]; then
  state_down
  state_up
elif [[ "${desired_state}" == "down" ]]; then
  state_down
fi
