{ pkgs }: {
    deps = [
        pkgs.run
        pkgs.python39Packages.pip
        pkgs.qtile
        pkgs.nodejs-16_x
        pkgs.cowsay
    ];
}