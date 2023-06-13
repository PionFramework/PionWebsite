---
sidebar_position: 8
---

# Channels

Channels are a message system for communication between threads. Depending on the platform, channels may be built on
top of various underlying systems. Intraprocess channels generally require only that the threads of a process share a
memory space, while interprocess channels may use sockets or pipes.

## Creating a Channel

The `Channel` template is parameterized by the type of the message that will be sent across the channel, as well as the
type of queue that will be used. The default queue type is a blocking ring buffer queue, but this can be replaced with
another if desired, such as a lock-free queue. A `Channel` acts as a reference type, which is copyable. Every copy is a
handle on the same channel, whose state is stored independently of any `Channel` instance on the heap. The state is
freed when the reference count of the channel reaches 0. The `InputChannel` is a read-only version of `Channel`, and
`OutputChannel` is an output-only version. `Channel` is a subclass which extends both of these.

## Selecting from Multiple Channels

The function `Channel::Select` allows for waiting on one of multiple channels to have a message. The call will block
until a message is received from one of the channels.

```cpp
Channel::Select([](auto&& channel, auto&& msg) {
    if (channel == channel1) {
        // For channel1 message
    } else if (channel == channel2) {
        // For channel2 message
    } else {
        // For channel3 message
    }
}, channel1, channel2, channel3);
```

The callback takes a reference to the channel as well as a reference to the message. The callback can be conditionally
handled based on which channel received a message, or, in a `constexpr` context, the type of the message, assuming it
differs between all channels (or some combination thereof).

## Interprocess Channels

Interprocess channels are a special case of `Channel`. These use the types `SharedChannel` or `SharedNamedChannel`. The
`SharedChannel` should be constructed within `SharedMemory` so that it can be accessible to multiple processes. The
`SharedNamedChannel` acts as a handle to a system-wide channel of a given name. It interacts with any other channel
constructed with the same name on the same system. As with intraprocess channels, it is also possible to use
`SharedInputChannel`/`SharedNamedInputChannel` and `SharedOutputChannel`/`SharedNamedOutputChannel` to get read-only or
write-only versions of the channel.

:::info

Types used as messages for interprocess channels must be serializable with the Pion ser/des system.

:::
