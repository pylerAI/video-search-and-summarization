{{/*
Chart name
*/}}
{{- define "vss-base.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fully qualified app name (release-chartname)
*/}}
{{- define "vss-base.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "vss-base.labels" -}}
helm.sh/chart: {{ include "vss-base.name" . }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: vss-base
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{/*
Selector labels for a component
Usage: {{ include "vss-base.selectorLabels" (dict "component" "phoenix" "root" .) }}
*/}}
{{- define "vss-base.selectorLabels" -}}
app.kubernetes.io/name: {{ .component }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
{{- end }}

{{/*
Image pull secrets
*/}}
{{- define "vss-base.imagePullSecrets" -}}
{{- if .Values.global.imagePullSecrets }}
imagePullSecrets:
{{- range .Values.global.imagePullSecrets }}
  - name: {{ .name }}
{{- end }}
{{- end }}
{{- end }}

{{/*
External IP - fallback to hostIP if externalIP is not set
*/}}
{{- define "vss-base.externalIP" -}}
{{- if .Values.global.externalIP }}
{{- .Values.global.externalIP }}
{{- else }}
{{- .Values.global.hostIP }}
{{- end }}
{{- end }}

{{/*
Service internal URL helpers
*/}}
{{- define "vss-base.redis.url" -}}
{{ include "vss-base.fullname" . }}-redis:{{ .Values.redis.port }}
{{- end }}

{{- define "vss-base.postgres.url" -}}
{{ include "vss-base.fullname" . }}-postgres:5432
{{- end }}

{{- define "vss-base.vstIngress.url" -}}
http://{{ include "vss-base.fullname" . }}-vst-ingress:{{ .Values.vstIngress.port }}
{{- end }}

{{- define "vss-base.sensorMs.url" -}}
http://{{ include "vss-base.fullname" . }}-sensor-ms:{{ .Values.sensorMs.port }}
{{- end }}

{{- define "vss-base.storageMs.url" -}}
http://{{ include "vss-base.fullname" . }}-storage-ms:{{ .Values.storageMs.port }}
{{- end }}

{{- define "vss-base.vstMcp.url" -}}
http://{{ include "vss-base.fullname" . }}-vst-mcp:{{ .Values.vstMcp.port }}
{{- end }}

{{- define "vss-base.vssAgent.url" -}}
http://{{ include "vss-base.fullname" . }}-vss-agent:{{ .Values.vssAgent.port }}
{{- end }}

{{- define "vss-base.llmNim.url" -}}
http://{{ include "vss-base.fullname" . }}-llm-nim:{{ .Values.llmNim.port }}
{{- end }}

{{- define "vss-base.vlmNim.url" -}}
http://{{ include "vss-base.fullname" . }}-vlm-nim:{{ .Values.vlmNim.port }}
{{- end }}

{{- define "vss-base.phoenix.url" -}}
http://{{ include "vss-base.fullname" . }}-phoenix:{{ .Values.phoenix.port }}
{{- end }}
