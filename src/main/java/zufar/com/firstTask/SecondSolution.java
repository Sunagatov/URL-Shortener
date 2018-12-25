package zufar.com.firstTask;

public class SecondSolution {
    public static void main(String[] args) {
        for (int i = 1; i < 256; i++) {
            String word="";
            if(i%3==0) word="Fizz";
            if(i%5==0) word+="Buzz";
            if(word.isEmpty()) word=Integer.toString(i);
            System.out.print(word+'\n');
        }
    }
}