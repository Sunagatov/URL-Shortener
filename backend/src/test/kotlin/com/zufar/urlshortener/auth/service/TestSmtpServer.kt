package com.zufar.urlshortener.auth.service

import java.net.InetAddress
import java.net.ServerSocket
import java.util.concurrent.Executors
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

/** An isolated loopback SMTP recipient. It never forwards messages. */
internal class TestSmtpServer : AutoCloseable {
    private val server = ServerSocket(0, 10, InetAddress.getByName("127.0.0.1"))
    private val worker = Executors.newSingleThreadExecutor()
    private val messages = LinkedBlockingQueue<String>()
    val port: Int get() = server.localPort

    init {
        worker.submit {
            while (!server.isClosed) {
                try {
                    server.accept().use { socket ->
                        socket.soTimeout = 5000
                        val reader = socket.getInputStream().bufferedReader()
                        val writer = socket.getOutputStream().bufferedWriter()
                        fun reply(value: String) { writer.write("$value\r\n"); writer.flush() }
                        reply("220 localhost test SMTP")
                        while (true) {
                            val command = reader.readLine() ?: break
                            when {
                                command.startsWith("DATA", true) -> {
                                    reply("354 End with dot")
                                    val data = StringBuilder()
                                    while (true) {
                                        val line = reader.readLine() ?: break
                                        if (line == ".") break
                                        data.appendLine(line.removePrefix(".."))
                                    }
                                    messages.add(data.toString())
                                    reply("250 Accepted")
                                }
                                command.startsWith("QUIT", true) -> { reply("221 Bye"); break }
                                else -> reply("250 OK")
                            }
                        }
                    }
                } catch (_: java.io.IOException) {
                    if (!server.isClosed) throw IllegalStateException("Local SMTP test failed")
                }
            }
        }
    }

    fun receive(): String = requireNotNull(messages.poll(5, TimeUnit.SECONDS)) { "No mail delivered to local SMTP" }
    fun hasMessage(): Boolean = messages.isNotEmpty()
    override fun close() { server.close(); worker.shutdownNow() }
}
