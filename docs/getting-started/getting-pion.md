---
sidebar_position: 1
---

# Getting Pion

## Requirements

Pion acts as a replacement for the standard C++ library, and necessarily must support a wide range of platforms. However
it can't support everything, so it is important to ensure your development target is supported.

Pion supports the following compilers:

* GCC 13 and later.
* Clang 16 and later.

Pion supports the following architectures:

* x86/x86_64
* ARMv7 and ARMv8, 32- and 64-bit, A, R, and M profiles
* RISC-V 32- and 64-bit, with minimum G profile
* POWER8, POWER9, and POWER10 32- and 64-bit, in little and big endian
* WebAssembly 32- and 64-bit (with WASI), including threading

Not all combinations of platform, architecture, and compiler are supported. See below for the full support matrix.

<details>
<summary>Support Matrix</summary>

| Platform                  | i686 | x86_64 | ARMv7-a | ARMv7-r | ARMv7-m | ARMv8-a AArch64 | ARMv8-a AArch32 | ARMv8-r AArch64 | ARMv8-r AArch32 | ARMv8-m | RV32GC | RV64GC | POWER8 32-bit | POWER8 32-bit LE | POWER8 64-bit | POWER8 64-bit LE | POWER9 32-bit | POWER9 32-bit LE | POWER9 64-bit | POWER9 64-bit LE | POWER10 32-bit | POWER10 32-bit LE | POWER10 64-bit | POWER10 64-bit LE | WASM32 | WASM64 |
|---------------------------|------|--------|---------|---------|---------|-----------------|-----------------|-----------------|-----------------|---------|--------|--------|---------------|------------------|---------------|------------------|---------------|------------------|---------------|------------------|----------------|-------------------|----------------|-------------------|--------|--------|
| Web (Clang)               |      |        |         |         |         |                 |                 |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   | ✔      | ✔      |
| GNU/Linux (GCC/Clang)     | ✔️   | ✔️     | ✔️      |         | ✔       | ✔️              | ✔️              |                 |                 | ✔       | ✔      | ✔      | ✔             | ✔                | ✔             | ✔                | ✔             | ✔                | ✔             | ✔                | ✔              | ✔                 | ✔              | ✔                 |        |        |
| Windows (Clang)           | ✔️   | ✔️     | ✔️      |         | ✔       | ✔️              | ✔️              |                 |                 | ✔       |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Windows MinGW (GCC/Clang) | ✔️   | ✔️     | ✔️      |         | ✔       | ✔️              | ✔️              |                 |                 | ✔       |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Windows ARM64EC (Clang)   |      |        |         |         |         | ✔️              |                 |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| ReactOS (Clang)           | ✔️   | ✔️     |         |         |         |                 |                 |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Darwin (Clang)            |      |        |         |         |         | ✔               |                 |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| FreeBSD (GCC/Clang)       | ✔    | ✔      | ✔       |         | ✔       | ✔               | ✔               |                 |                 | ✔       |        | ✔      | ✔             |                  | ✔             | ✔                |               |                  | ✔             | ✔                |                |                   | ✔              | ✔                 |        |        |
| OpenBSD (GCC/Clang)       | ✔    | ✔      | ✔       |         | ✔       | ✔               | ✔               |                 |                 | ✔       |        | ✔      |               |                  | ✔             |                  |               |                  | ✔             |                  |                |                   | ✔              |                   |        |        |
| NetBSD (GCC/Clang)        | ✔    | ✔      | ✔       |         | ✔       | ✔               | ✔               |                 |                 | ✔       |        | ✔      |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| DragonflyBSD (GCC/Clang)  |      | ✔      |         |         |         |                 |                 |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Android (Clang)           | ✔    | ✔      | ✔       |         | ✔       | ✔               | ✔               |                 |                 | ✔       |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Fuchsia (Clang)           |      | ✔      | ✔       |         | ✔       | ✔               | ✔               |                 |                 | ✔       |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Illumos (GCC/Clang)       |      | ✔      |         |         |         |                 |                 |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Haiku OS (GCC)            | ✔    | ✔      |         |         |         |                 |                 |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Playstation 5 (Clang)     |      | ✔      |         |         |         |                 |                 |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| FreeRTOS (Clang)          | ✔    |        | ✔       |         | ✔       | ✔               | ✔               |                 |                 |         | ✔      | ✔      |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| RT-Thread (Clang)         | ✔    | ✔      | ✔       | ✔       | ✔       |                 | ✔               |                 | ✔               | ✔       | ✔      |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Zephyr (Clang)            | ✔    | ✔      | ✔       | ✔       | ✔       | ✔               | ✔               | ✔               | ✔               | ✔       | ✔      | ✔      |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Mbed OS (Clang)           |      |        | ✔       |         | ✔       | ✔               | ✔               |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| PhoenixRTOS (Clang)       | ✔    |        | ✔       | ✔       | ✔       |                 | ✔               |                 |                 |         | ✔      | ✔      |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| MyNewt (Clang)            |      |        | ✔       | ✔       | ✔       | ✔               | ✔               | ✔               | ✔               | ✔       | ✔      | ✔      |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| NuttX (Clang)             |      |        | ✔       | ✔       | ✔       | ✔               | ✔               |                 |                 |         | ✔      |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| VxWorks (Clang)           | ✔    | ✔      | ✔       | ✔       | ✔       | ✔               | ✔               | ✔               | ✔               | ✔       | ✔      | ✔      |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| AzureRTOS (Clang)         |      |        | ✔       | ✔       | ✔       | ✔               | ✔               |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Neutrino (Clang)          |      | ✔      | ✔       |         | ✔       | ✔               | ✔               |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| ChibiOS (Clang)           |      |        | ✔       | ✔       | ✔       |                 | ✔               |                 | ✔               | ✔       |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| LynxOS (Clang)            | ✔    | ✔      | ✔       |         | ✔       | ✔               | ✔               |                 |                 |         |        |        |               |                  |               |                  |               |                  |               |                  |                |                   |                |                   |        |        |
| Bare Metal (GCC/Clang)    | ✔    | ✔      | ✔       | ✔       | ✔       | ✔               | ✔               | ✔               | ✔               | ✔       | ✔      | ✔      | ✔             | ✔                | ✔             | ✔                | ✔             | ✔                | ✔             | ✔                | ✔              | ✔                 | ✔              | ✔                 |        |        |

</details>

## Using a Dependency Manager

The easiest way to get started with developing Pion is to use a C++ dependency management system. Pion supports Conan
2.x, vcpkg, and xrepo.

### Conan

The Pion dependency can be added to your `conanfile.txt` to get the Pion Core libraries and modules.

:::info

Pion only has official support for Conan 2.x.

:::

For example, using the CMake generator:

```toml title="conanfile.txt"
[requires]
pion-framework/0.0.1

[generators]
CMakeDeps
CMakeToolchain
```

Or you can add it to your `conanfile.py` file.

```python title="conanfile.py"
from conan import ConanFile
from conan.tools.cmake import CMakeToolchain, CMake, cmake_layout

required_conan_version = ">=2.0.0"


class MyProjectConan(ConanFile):
    name = 'my-project'
    version = '1.0.0'
    license = 'Apache-2.0'
    package_type = 'application'

    settings = 'os', 'compiler', 'build_type', 'arch'
    options = {
        'fPIC': [True, False]
    }
    default_options = {
        'fPIC': True
    }

    def requirements(self):
        self.requires('pion-framework/0.0.1')

    def layout(self):
        cmake_layout(self)

    def build(self):
        cmake = CMake(self)
        cmake.configure()
        cmake.build()
```

### vcpkg

```json title="vcpkg.json"
{
  "$schema": "https://raw.githubusercontent.com/microsoft/vcpkg-tool/main/docs/vcpkg.schema.json",
  "name": "my-project",
  "version-semver": "1.0.0",
  "license": "Apache-2.0",
  "dependencies": [
    "pion-framework"
  ]
}
```

### xrepo

```lua title="xmake.lua"
add_requires("pion-framework >0.0.1")

target("my-app")
    set_kind("binary")
    add_files("src/main/cpp/*.cppm", "src/main/cpp/*.cpp")
    add_packages("pion-framewwork")
```

## Building From Scratch

To build Pion from scratch you will need CMake version 3.26.3 or newer and LLVM/Clang version 16.x or newer.

### Linux

```shell title="Installing on Fedora"
sudo dnf install clang clang-tools-extra cmake
```

```shell title="Installing on Debian/Ubuntu"
wget -qO- https://apt.llvm.org/llvm-snapshot.gpg.key | sudo tee /etc/apt/trusted.gpg.d/apt.llvm.org.asc
sudo apt-get install clang-16 clang-tools-16 libclang-rt-16
```

### Windows

```shell title="Installing with winget"
winget install Kitware.Cmake
winget install LLVM.LLVM
winget install Microsoft.WindowsSDK.10.0.22621
winget install Microsoft.VisualStudio.2022.Community
```

### Getting and Compiling Pion

Once the prerequisites are installed, you can fetch and build and install Pion using the predefined presets.

```shell title="Compiling Pion"
git clone https://github.com/PionFramework/PionCore.git
cd PionCore
cmake --preset <preset name> --build --target install
```

The presets define the CPU architecture, platform, ABI, and whether the build is a debug or release build. To get a list
of available presets use `cmake --list-presets`. Examples of presets include:

* `x86_64-linux-gnu-release`
* `x86_64-linux-gnu-debug`
* `armv8-linux-gnueabi-release`
* `rv32gcv-linux-gnupsabi-release`
* `x86_64-win32-msvc-debug`
* `wasm32-release`

Note that the debug presets also typically include profiling for the purpose of profile-guided optimizations. You can
define your own presets based on the existing ones by creating the file `CMakeUserPresets.json` in the root PionCore
directory.

## Advanced Configuration

### Compilation Profiles

Pion has three profiles: standard, exception-free, and realtime. The exception-free profile is a subset of the standard
profile in which all potentially-throwing functions have been removed. All potentially-throwing Pion functions have
non-throwing alternatives, and in the exception-free profile only those alternatives are available. This can be enabled
by passing `-DDISABLE_EXCEPTIONS=ON` to CMake when building Pion. If using Conan, vcpkg, or xrepo, you can enable this
by using the `exceptionFree` option/feature.

The realtime profile is a subset of the exception-free
profile. It also disables potentially-throwing functions, but also makes the default allocator the $O(1)$ realtime
allocator and disables the other allocators. It also removes certain non-realtime-safe functionality, including any
priority-inverting synchronization primitives, and makes the default mutex a priority-inheriting mutex. This profile can
be built by passing `-DENABLE_REALTIME=ON`, which also implies `-DDISABLE_EXCEPTIONS=ON`. If using Conan, vcpkg, or
xrepo you can enable this by using the `realtime` option/feature.

### Allocator Compilation Options

When not building the realtime profile, the default allocator can be altered by passing
`-DENABLE_DEFAULT_SECURE_ALLOCATOR=ON` to make the secure allocator the default one, or
`-DENABLE_DEFAULT_REALTIME_ALLOCATOR=ON` to make the realtime $O(1)$ allocator the default one. The option
`-DUSE_SHARED_ALLOCATOR=ON` will compile the Pion allocator library in shared mode. In this case the
`Pion.Allocator.Shared.<so/dll>` file must be distributed with your application. Doing this allows end users to hook the
allocation functions to replace or instrument the default, e.g. by using `LD_PRELOAD`. In Conan, vcpkg, or xrepo the
option/feature name for these are:

* `defaultSharedAllocator`
* `defaultRealtimeAllocator`
* `sharedAllocator`
