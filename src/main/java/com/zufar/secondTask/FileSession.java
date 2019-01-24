package com.zufar.secondTask;

import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

class FileSession {

    private final FileConnection fileConnection;

    FileSession(FileConnection fileConnection) {
        this.fileConnection = fileConnection;
    }

    int readNumber() throws IOException {
        Scanner reader = fileConnection.getReader();
        int currentNumber = reader.nextInt();
        reader.close();
        return currentNumber;
    }

    void writeNumber(int currentNumber) throws IOException {
        FileWriter writer = fileConnection.getWriter();
        writer.write(Integer.toString(currentNumber));
        writer.flush();
        writer.close();
    }
}
