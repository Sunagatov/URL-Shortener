package zufar.com.thirdTask;

import java.util.*;

public class App {
    //Digit1 Unit1 = Digit2 Unit2
    //<K,V> - <Unit1+Unit2, Digit1/Digit2>
    private static Map<Key, Double> statements = new HashMap<>();

    public static void main(String[] args) {
        addStatementToStatements(new Statement(1024.0, "byte", 1.0, "kilobyte"));
        addStatementToStatements(new Statement(2.0, "bar", 12.0, "ring"));
        addStatementToStatements(new Statement(16.8, "ring", 2.0, "pyramid"));
        addStatementToStatements(new Statement(1.0, "byte", 8.0, "bit"));
        addStatementToStatements(new Statement(15.0, "ring", 2.5, "bar"));
        addStatementToStatements(new Statement(4.0, "hare", 1.0, "cat"));
        addStatementToStatements(new Statement(5.0, "cat", 0.5, "giraffe"));

        Statement statement = new Statement(1.0, "giraffe", null, "hare");

        Key key = new Key(statement.firstUnit, statement.secondUnit);

        for (Map.Entry<Key, Double> current : statements.entrySet()) {
            if (current.getKey().firstUnit.equals(key.firstUnit) && current.getKey().secondUnit.equals(key.secondUnit)) {
                Double neededValue = current.getValue();
                System.out.println(key + " - " + neededValue / statement.firstDigit);
            }
        }
    }


    private static void addStatementToStatements(Statement statement) throws IllegalArgumentException {
        if (!isStatementCorrect(statement))
            throw new IllegalArgumentException("Error! Adding new statement is impossible! Statement is incorrect!");
        String firstUnit = statement.firstUnit;
        String secondUnit = statement.secondUnit;
        Double firstValue = statement.value;
        Double secondValue = 1 / firstValue;
        Key firstPairKey = new Key(firstUnit, secondUnit);
        Key secondPairKey = new Key(secondUnit, firstUnit);
        if (!isPairKeyInStatements(firstPairKey)) {
            statements.put(firstPairKey, firstValue);
        }
        if (!isPairKeyInStatements(secondPairKey)) {
            statements.put(secondPairKey, secondValue);
        }
        check(statement);
    }

    private static void check(Statement statement) {
        Map<Key, Double> map = new HashMap<>();
        Iterator<Map.Entry<Key, Double>> iterator = statements.entrySet().iterator();
        for (Map.Entry<Key, Double> current : statements.entrySet()) {
            String firstUnit1 = current.getKey().firstUnit;
            String firstUnit2 = statement.firstUnit;
            String secondUnit1 = current.getKey().secondUnit;
            String secondUnit2 = statement.secondUnit;
            if (firstUnit1.equals(firstUnit2) && !secondUnit1.equals(secondUnit2)) {
                Key firstKey = new Key(secondUnit1, secondUnit2);
                Double value1 = statement.value / current.getValue();
                map.put(firstKey, value1);
                Key secondKey = new Key(secondUnit2, secondUnit1);
                Double value2 = 1 / value1;
                map.put(secondKey, value2);
            }
        }
        statements.putAll(map);
    }

    private static boolean isStatementCorrect(Statement statement) {
        String firstValue = statement.firstUnit;
        String secondValue = statement.secondUnit;
        Double value = statement.value;
        return value == null || value != 0 || firstValue == null || !firstValue.isEmpty()
                || secondValue == null || !secondValue.isEmpty();
    }

    private static boolean isPairKeyInStatements(Key pairKey) {
        return statements.containsKey(pairKey);
    }

    static class Statement {
        final String firstUnit;
        final String secondUnit;
        final Double value;
        final Double firstDigit;
        final Double secondDigit;

        Statement(Double firstDigit, String firstUnit, Double secondDigit, String secondUnit) {
            this.firstUnit = firstUnit;
            this.secondUnit = secondUnit;
            this.firstDigit = firstDigit;
            this.secondDigit = secondDigit;
            if (firstDigit == null || secondDigit == null) {
                value = null;
            } else {
                this.value = secondDigit / firstDigit;
            }
        }
    }

    static class Key {
        final String firstUnit;
        final String secondUnit;

        Key(String firstUnit, String secondUnit) {
            this.firstUnit = firstUnit;
            this.secondUnit = secondUnit;
        }

        @Override
        public String toString() {
            return "(" + firstUnit + " - " + secondUnit + ")";
        }

        @Override
        public int hashCode() {
            return firstUnit.hashCode() * secondUnit.hashCode() * 7;
        }
    }

    static void printStatements() {
        for (Map.Entry<Key, Double> current : statements.entrySet()) {
            System.out.println(current.getKey() + " - " + current.getValue());
        }

    }
}