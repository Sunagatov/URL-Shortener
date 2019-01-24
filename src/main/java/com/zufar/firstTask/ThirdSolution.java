package com.zufar.firstTask;

public class ThirdSolution {
    public static void main(String[] args) {
        for (int i = 1; i < 256; i++) {
            String n=Integer.toString(i), fizz = "Fizz", buzz="Buzz";
            if(i%3!=0) fizz=""; else n="";
            if(i%5!=0) buzz=""; else n="";
            System.out.println(n+fizz+buzz);

        }
    }
}
