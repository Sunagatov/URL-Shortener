package zufar.com.thirdTask;

import java.io.File;
import java.util.*;

public class App {

    public static void main(String[] args) {
        List<Statement> statementsForRules;
        List<Statement> inputStatements;
        try {
            statementsForRules = DataHandler.getStatementsFromFile(new File(".\\src\\resources\\Rules.txt"));
            inputStatements = DataHandler.getStatementsFromFile(new File(".\\src\\resources\\Input.txt"));
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return;
        }
        StatementHandler.createRulesByStatements(statementsForRules);

        for (Statement currentStatement : inputStatements) {
            String result = StatementHandler.handleStatement(currentStatement);
            System.out.println(result);
        }
    }
}