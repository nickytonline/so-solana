# GitHUB CLI because it's awesome
if command -v brew &> /dev/null
then
  brew install gh
else
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update
  sudo apt install -y gh
fi

# Install things for node/frontend land
if command -v brew &> /dev/null
then
  nvm install $(cat .nvmrc)
  nvm alias default $(cat .nvmrc)
  npm install -g vercel

  if ! command -v yarn &> /dev/null
  then
    npm install -g yarn
  fi

  yarn install
fi

# Rust install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
rustc --version
rustup --version
cargo --version

# Solana install
sh -c "$(curl -sSfL https://release.solana.com/v1.8.2/install)"
PATH="/home/gitpod/.local/share/solana/install/active_release/bin:$PATH"
echo 'PATH="/home/gitpod/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
solana config set --url localhost

# Anchor
sudo apt update
sudo apt install -y libudev-dev
cargo install --git https://github.com/project-serum/anchor anchor-cli --locked
anchor --version
