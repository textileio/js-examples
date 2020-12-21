for d in ./*/ ; do
  if [ $d != "./scripts/" ]; then 
    (cd "$d" && npm install); 
  fi;
done
