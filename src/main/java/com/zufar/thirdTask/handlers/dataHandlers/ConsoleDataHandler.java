package com.zufar.thirdTask.handlers.dataHandlers;

import com.zufar.thirdTask.exceptions.InvalidDataException;
import com.zufar.thirdTask.Statement;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class ConsoleDataHandler extends DataHandler {

    public ConsoleDataHandler() {
        super();
    }

    public List<Statement> getStatements(Scanner scanner)
            throws InvalidDataException, IllegalArgumentException {
        List<String> stringsFromFile = getInputStrings(scanner);
        if (stringsFromFile.isEmpty()) throw new IllegalArgumentException("Error! The console data is empty!");
        List<Statement> statements = parseStringsToStatements(stringsFromFile);
        if (statements.isEmpty())
            throw new IllegalArgumentException("Error! There are no valid statements from a console!");
        return statements;
    }

    protected List<String> getInputStrings(Scanner scanner) {
        List<String> stringStatements = new ArrayList<>();
        while (scanner.hasNextLine()) {
            String stringStatement = scanner.nextLine();
            if (stringStatement.equals("end")) break;
            stringStatements.add(stringStatement);
        }
        return stringStatements;
    }
}
