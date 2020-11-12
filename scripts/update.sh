for d in ./*/ ; do
  if [ $d != "./scripts/" ]; then 
    (cd "$d" && npm run textile:upgrade && npm install); 
  fi;
done
