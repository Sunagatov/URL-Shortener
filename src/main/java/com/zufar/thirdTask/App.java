package com.zufar.thirdTask;

import com.zufar.thirdTask.handlers.RulesHandler;
import com.zufar.thirdTask.handlers.dataHandlers.ConsoleDataHandler;
import com.zufar.thirdTask.handlers.dataHandlers.DataHandler;
import com.zufar.thirdTask.handlers.dataHandlers.FileDataHandler;
import com.zufar.thirdTask.handlers.StatementHandler;

import java.io.File;
import java.util.*;

public class App {

    public static void main(String[] args) {
        //List<Statement> statementsForRules;
        List<Statement> inputStatements;
        /*DataHandler dataHandler = learnInputTypeFromUser();
        try {
            if (dataHandler instanceof ConsoleDataHandler) {
                System.out.println("Enter statements for rules in a new line or type 'end' to finish");
                statementsForRules = dataHandler.getStatements(new Scanner(System.in));
                System.out.println("Enter statements for conversion in a new line or type 'end' to finish");
                inputStatements = dataHandler.getStatements(new Scanner(System.in));
            } else if (dataHandler instanceof FileDataHandler) {
                statementsForRules = dataHandler.getStatements(new Scanner(new File(".\\src\\resources\\Rules.txt")));
                inputStatements = dataHandler.getStatements(new Scanner(new File(".\\src\\resources\\Input.txt")));
            } else {
                throw new UnsupportedOperationException();
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return;
        }
        Map<RulesHandler.RuleKey, Double> rules = RulesHandler.createRulesByStatements(statementsForRules);
        String result = StatementHandler.handleStatementsByRules(inputStatements, rules);
        System.out.println(result);*/
//        List<Statement> statementsForRules = new ArrayList<>();
//        statementsForRules.add(new Statement(1024.0, "byte", 1.0, "kilobyte"));
//        statementsForRules.add(new Statement(2.0, "bar", 12.0, "ring"));
//        statementsForRules.add(new Statement(16.8, "ring", 2.0, "pyramid"));
//        statementsForRules.add(new Statement(1.0, "byte", 8.0, "bit"));
//        statementsForRules.add(new Statement(15.0, "ring", 2.5, "bar"));
//        statementsForRules.add(new Statement(4.0, "hare", 1.0, "cat"));
//        statementsForRules.add(new Statement(5.0, "cat", 0.5, "giraffe"));
//        final Map<RulesHandler.RuleKey, Double> rules = RulesHandler.createRulesByStatements(statementsForRules);
//        int i = 0;
    }

    private static DataHandler learnInputTypeFromUser() {
        while (true) {
            System.out.println("Do your prefer to use the console input, the file input? Type '1', '2'");
            Scanner scanner = new Scanner(System.in);
            String choice = scanner.next();
            switch (choice) {
                case ("1"): {
                    return new ConsoleDataHandler();
                }
                case ("2"): {
                    return new FileDataHandler();
                }
                default:
                    break;
            }
        }
    }
}
