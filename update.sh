#!/bin/bash
if [ "$(git pull)" = "Already up to date." ]
then
  exit
else
  systemctl restart Interrobang.service
fi
