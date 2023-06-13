---
sidebar_position: 2
---

# Creating a Pion Project

Pion is most easily supported when using CMake or xmake as your build system. This guide will use CMake as it is the
most mature and widely used, but we will touch on xmake briefly as well in this document.

Pion is natively designed for C++20 modules, and does not have any support for legacy header-based development. As such
it will be assumed here that your project is also designed around modules. Pion requires your project use C++23 or
later.

:::info

As of the time of this writing, C++ module support varies with tooling, IDEs, and compilers. Pion is known to work with
Clang 16+ and CMake, although the CMake support is experimental. GCC support still requires Clang be installed as it
currently depends on `clang-scan-deps`, until GCC gains an equivalent tool.

For the best results it is recommended you use CMake as your build tool and CLion as your IDE, as they have the most
well-tested modules support.

:::

## Using CMake

With Pion installed as per our Getting Pion chapter, you can now create a directory called `MyPionProject`. Inside that
directory create you `CMakeLists.txt` file. Note that Pion requires CMake 3.26.0 or later.

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.26)
project(MyPionProject
        LANGUAGES CXX
        VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_VISIBILITY_PRESET hidden)
set(CMAKE_VISIBILITY_INLINES_HIDDEN ON)

find_package(Pion CONFIG REQUIRED)

add_executable(${PROJECT_NAME})
target_sources(${PROJECT_NAME} PRIVATE
        src/main/cpp/Main.cpp

    PUBLIC FILE_SET modules TYPE CXX_MODULES FILES
        # Put module files here.
)
target_link_libraries(${PROJECT_NAME} PUBLIC
    Pion::Core
    Pion::IO
)
```

Now create the directory `src/main/cpp`, and in it create `Main.cpp`.

```cpp title="Main.cpp"
import Pion;
import Pion.IO;

using namespace Pion;
using namespace Pion::IO;

int main() {
    StandardOut.Write("Hello, World!");
}
```

## Using xmake
