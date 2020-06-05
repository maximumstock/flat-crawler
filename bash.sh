MSG=$(node index.js)
echo ${#MSG}

if [ ${#MSG} -ge 5 ]; then
  echo "Sending mail..."
  echo $MSG | mail -s "Wohnungen" $MAILTO
fi
