package com.zufar.thirdTask.handlers;

import com.zufar.thirdTask.Statement;

import java.util.List;
import java.util.Map;

public class StatementHandler {

    public static String handleStatementsByRules(List<Statement> inputStatements, Map<RulesHandler.RuleKey, Double> rules) {
        StringBuilder result = new StringBuilder("");
        for (Statement currentStatement : inputStatements) {
            RulesHandler.RuleKey key = new RulesHandler.RuleKey(currentStatement.firstUnit, currentStatement.secondUnit);
            Double value = rules.get(key);
            if (value == null) {
                result.append("Conversion is impossible!\n");
            } else {
                result.append(key + " - " + value + "\n");
            }
        }
        return result.toString();
    }

    public static boolean isStatementCorrect(Statement statement) {
        String firstValue = statement.firstUnit;
        String secondValue = statement.secondUnit;
        Double value = statement.value;
        return value == null || value != 0 || firstValue == null || !firstValue.isEmpty()
                || secondValue == null || !secondValue.isEmpty();
    }
}
