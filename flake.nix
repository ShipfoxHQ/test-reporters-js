{
  description = "Allegoria Monorepo Nix configuration file";

  # Flake inputs
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  # Flake outputs
  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let 
        pkgs = import nixpkgs { inherit system; };
      in
      {
        # Development environment output
        devShells =  {
          default = pkgs.mkShell {
            # The Nix packages provided in the environment
            packages = with pkgs; [
              # Node
              nodePackage
              pkgs.nodePackages.pnpm
            ];
          };
        };
      }
    );
}
