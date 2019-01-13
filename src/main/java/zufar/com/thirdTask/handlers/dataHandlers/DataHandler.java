package zufar.com.thirdTask.handlers.dataHandlers;

import zufar.com.thirdTask.Statement;
import zufar.com.thirdTask.exceptions.InvalidDataException;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public abstract class DataHandler {

    public abstract List<Statement> getStatements(Scanner scanner)
            throws FileNotFoundException, InvalidDataException, IllegalArgumentException;

    protected List<String> getInputStrings(Scanner scanner) {
        List<String> stringStatements = new ArrayList<>();
        while (scanner.hasNextLine()) {
            String stringStatement = scanner.nextLine();
            stringStatements.add(stringStatement);
        }
        return stringStatements;
    }

    List<Statement> parseStringsToStatements(List<String> strings)
            throws IllegalArgumentException, InvalidDataException {
        List<Statement> statements = new ArrayList<>();
        for (String currentString : strings) {
            Statement statement = parseStringToStatement(currentString);
            statements.add(statement);
        }
        return statements;
    }

    private Statement parseStringToStatement(String string) throws InvalidDataException {
        String[] strings = string.trim().split(" ");
        if (strings.length != 5) {
            throw new InvalidDataException("Error! Incorrect data format!");
        }
        Double firstDigit = null;
        String stringFirstDigit = strings[0];
        if (!stringFirstDigit.equals("?")) {
            try {
                firstDigit = Double.parseDouble(strings[0]);
            } catch (NumberFormatException e) {
                throw new InvalidDataException("Error! Impossible to parse a first digit in a statement!");
            }
        }
        String firstUnit = strings[1]; //Название велечины может содержать любые символы, поэтому не нуждается в проверке
        String equalSign = strings[2];
        if (!equalSign.equals("=")) {
            throw new InvalidDataException("Error! Impossible to find an equal sign in a statement!");
        }
        Double secondDigit = null;
        String stringSecondDigit = strings[3];
        if (!stringSecondDigit.equals("?")) {
            try {
                secondDigit = Double.parseDouble(strings[3]);
            } catch (NumberFormatException e) {
                throw new InvalidDataException("Error! Impossible to parse a second digit in a statement!");
            }
        }
        String secondUnit = strings[4]; //Название велечины может содержать любые символы, поэтому не нуждается в проверке

        if (firstDigit == null && secondDigit == null) {
            throw new InvalidDataException("Error! A statement can not have two digits as '?'.");
        }
        return new Statement(firstDigit, firstUnit, secondDigit, secondUnit);
    }

    public static List<Statement> getDefaultStatements() {
        List<Statement> statements = new ArrayList<>();
        statements.add(new Statement(1024.0, "byte", 1.0, "kilobyte"));
        statements.add(new Statement(2.0, "bar", 12.0, "ring"));
        statements.add(new Statement(16.8, "ring", 2.0, "pyramid"));
        statements.add(new Statement(1.0, "byte", 8.0, "bit"));
        statements.add(new Statement(15.0, "ring", 2.5, "bar"));
        statements.add(new Statement(4.0, "hare", 1.0, "cat"));
        statements.add(new Statement(5.0, "cat", 0.5, "giraffe"));
        return statements;
    }

    public static List<Statement> getInputStatements() {
        List<Statement> inputStatements = new ArrayList<>();
        inputStatements.add(new Statement(1.0, "pyramid", null, "bar"));
        inputStatements.add(new Statement(1.0, "giraffe", null, "hare"));
        inputStatements.add(new Statement(0.5, "byte", null, "cat"));
        inputStatements.add(new Statement(2.0, "kilobyte", null, "bit"));
        return inputStatements;
    }
}
