# set base image
ARG PERCEPTION_IMAGE
ARG PERCEPTION_TAG

FROM $PERCEPTION_IMAGE:$PERCEPTION_TAG

# set the working directory in the container
WORKDIR /opt/nvidia/deepstream/deepstream-8.0/sources/apps/sample_apps/metropolis_perception_app

# copy the dependencies file to the working directory
COPY ./deepstream/configs/* ./

# copy the start script
COPY ./deepstream/init-scripts/ds-start.sh ./

COPY ./deepstream/configs/rtdetr-960x544-labels.txt ./