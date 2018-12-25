package zufar.com.secondTask;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

class FileConnection {
    private final File file;

    FileConnection(File file) {
        this.file = file;
    }

    Scanner getReader() throws IOException {
        return new Scanner(file);
    }

    FileWriter getWriter() {
        IOException exception;
        try {
            return new FileWriter(file, false);
        } catch (IOException e) {
            exception = e;
        }
        throw new RuntimeException(exception);
    }
}
