package zufar.com.thirdTask.handlers.dataHandlers;

import zufar.com.thirdTask.Statement;
import zufar.com.thirdTask.exceptions.InvalidDataException;

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