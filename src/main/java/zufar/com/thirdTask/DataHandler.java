package zufar.com.thirdTask;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.*;

class DataHandler {

    static List<Statement> getDefaultStatements() {
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

    static List<Statement> getInputStatements() {
        List<Statement> inputStatements = new ArrayList<>();
        inputStatements.add(new Statement(1.0, "pyramid", null, "bar"));
        inputStatements.add(new Statement(1.0, "giraffe", null, "hare"));
        inputStatements.add(new Statement(0.5, "byte", null, "cat"));
        inputStatements.add(new Statement(2.0, "kilobyte", null, "bit"));
        return inputStatements;
    }

    static Statement getCorrectStatements() throws Exception {
        try (Scanner scanner = new Scanner(System.in)) {
            if (scanner.hasNext()) {
                return parseStatementFromString(scanner.next());
            }
        }
        throw new IllegalArgumentException("Error!");
    }

    static Statement parseStatementFromString(String input) throws Exception {
        if (input == null || input.isEmpty()) {
            throw new IllegalArgumentException();
        }
        String errorMessage = "Error! The input is invalid! Write input by pattern: firstDigit firstUnit = secondDigit Second Unit";
        String[] strings = input.trim().split(" ");
        if (strings.length != 5) {
            throw new Exception(errorMessage);
        }
        Double firstDigit = null;
        if (!strings[0].equals("?")) {
            try {
                firstDigit = Double.parseDouble(strings[0]);
            } catch (NumberFormatException e) {
                throw new Exception(errorMessage);
            }
        }
        String firstUnit = strings[1];
        if (!strings[2].equals("=")) {
            throw new Exception(errorMessage);
        }
        Double secondDigit = null;
        if (!strings[3].equals("?")) {
            try {
                secondDigit = Double.parseDouble(strings[3]);
            } catch (NumberFormatException e) {
                throw new Exception(errorMessage);
            }

        }
        String secondUnit = strings[4];
        if (firstDigit == null && secondDigit == null) {
            throw new Exception(errorMessage);
        }
        if (firstDigit == null) {
            return new Statement(null, firstUnit, secondDigit, secondUnit);
        }
        if (secondDigit == null) {
            return new Statement(firstDigit, firstUnit, null, secondUnit);
        }
        return new Statement(firstDigit, firstUnit, secondDigit, secondUnit);
    }

    static List<Statement> getStatementsFromFile(File file) throws Exception {
        List<String> stringStatements = getStringsStatementsFromFile(file);
        List<Statement> statements = new ArrayList<>();
        for (String currentStringStatement : stringStatements) {
            Statement statement = parseStatementFromString(currentStringStatement);
            statements.add(statement);
        }
        return statements;
    }

    private static List<String> getStringsStatementsFromFile(File file) throws FileNotFoundException {
        List<String> stringStatements;
        try (Scanner scanner = new Scanner(file)) {
            stringStatements = new ArrayList<>();
            while (scanner.hasNextLine()) {
                String stringStatement = scanner.nextLine();
                stringStatements.add(stringStatement);
            }
            return stringStatements;
        }
    }
}