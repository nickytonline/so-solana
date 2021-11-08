currentPath=$(pwd)
cd myepicproject
anchor build
anchor deploy
cd $currentPath
mv myepicproject/target/idl/myepicproject.json utilities/idl.json
git add utilities/idl.json
