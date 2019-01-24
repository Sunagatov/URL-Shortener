package com.zufar.thirdTask;

public class Statement {
    public final String firstUnit;
    public final String secondUnit;
    public final Double value;
    private final Double firstDigit;
    private final Double secondDigit;

    public Statement(Double firstDigit, String firstUnit, Double secondDigit, String secondUnit) {
        this.firstDigit = firstDigit;
        this.secondDigit = secondDigit;
        this.firstUnit = firstUnit;
        this.secondUnit = secondUnit;
        if (firstDigit == null || secondDigit == null) {
            value = null;
        } else {
            this.value = secondDigit / firstDigit;
        }
    }

    @Override
    public String toString() {
        if (firstDigit == null) {
            return "? " + firstUnit + " = " + secondDigit + " " + secondUnit;
        }
        if (secondDigit == null) {
            return firstDigit + " " + firstUnit + " = ? " + secondUnit;
        }
        return firstDigit + " " + firstUnit + " = " + secondDigit + " " + secondUnit;
    }
}
