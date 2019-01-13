package zufar.com.thirdTask;

import zufar.com.thirdTask.handlers.dataHandlers.ConsoleDataHandler;
import zufar.com.thirdTask.handlers.dataHandlers.DataHandler;
import zufar.com.thirdTask.handlers.dataHandlers.FileDataHandler;
import zufar.com.thirdTask.handlers.RulesHandler;
import zufar.com.thirdTask.handlers.StatementHandler;

import java.io.File;
import java.util.*;

public class App {

    public static void main(String[] args) {
        List<Statement> statementsForRules;
        List<Statement> inputStatements;
        DataHandler dataHandler = learnInputTypeFromUser();
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
        System.out.println(result);
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