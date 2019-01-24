package com.zufar.secondTask;

import java.io.File;
import java.io.IOException;

public class App {
    private static final int GUESSED_NUMBER = 1300;
    private static final File FILE = new File("out.txt");

    public static void main(String[] args) throws IOException {
        FileSession fileSession = new FileSession(new FileConnection(FILE));
        prepareFile(fileSession);
        Incrementer incrementer = new Incrementer(GUESSED_NUMBER, fileSession);
        Thread firstThread = new Thread(incrementer);
        Thread secondThread = new Thread(incrementer);
        firstThread.start();
        secondThread.start();
    }

    private static void prepareFile(FileSession fileSession) throws IOException {
        fileSession.writeNumber(0);
    }
}
