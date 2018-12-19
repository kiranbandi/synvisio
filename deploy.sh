#!/bin/sh
# Script to update apache server
# create new build folder
npm run build
# stop apache server
service apache2 stop
# clear old assets
rm -rf /var/www/html/
# copy new assets
cp -a build/. /var/www/html/
# restart apache server
service apache2 restart
echo "Deploy complete successfully"