package com.zufar.secondTask;

import java.io.IOException;

public class Incrementer implements Runnable {
    private final int guessedNumber;
    private final FileSession fileSession;
    private final Object lock = new Object();


    Incrementer(int guessedNumber, FileSession fileSession) {
        this.guessedNumber = guessedNumber;
        this.fileSession = fileSession;
    }

    @Override
    public void run() {
        try {
            while (true) {
                synchronized (lock) {
                    int currentNumber = fileSession.readNumber();

                    if (currentNumber == guessedNumber) {
                        break;
                    }
                    fileSession.writeNumber(++currentNumber);
                }
            }
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
    }
}
