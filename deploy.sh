#!/bin/sh
# create new build folder
npm run build
# stop apache server
service nginx stop
# clear old assets
rm -rf /var/www/synvisio/
# copy new assets
cp -a build/. /var/www/synvisio/
# restart apache server
service nginx restart
echo "SynVisio Deploy complete successfully"