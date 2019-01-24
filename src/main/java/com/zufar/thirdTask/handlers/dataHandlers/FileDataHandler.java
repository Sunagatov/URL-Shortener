package com.zufar.thirdTask.handlers.dataHandlers;

import com.zufar.thirdTask.exceptions.InvalidDataException;
import com.zufar.thirdTask.Statement;

import java.util.*;

public class FileDataHandler extends DataHandler {

    public FileDataHandler() {
        super();
    }

    public List<Statement> getStatements(Scanner scanner)
            throws InvalidDataException, IllegalArgumentException {
        List<String> stringsFromFile = getInputStrings(scanner);
        if (stringsFromFile.isEmpty()) throw new IllegalArgumentException("Error! The file is empty!");
        List<Statement> statements = parseStringsToStatements(stringsFromFile);
        if (statements.isEmpty())
            throw new IllegalArgumentException("Error! There are no valid statements in the file!");
        return statements;
    }
}
