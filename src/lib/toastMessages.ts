// Toast content for the transaction flows
// Grouped to enforce general grammatical syntax

export interface ToastMessage {
  variant?: "destructive";
  title: string;
  description: string;
}


/**
 * General grammatical rules
 * 1. Use capital letters at the start of sentences and for proper nouns (if applicable)
 *      -> "The quick brown fox" not "The Quick Brown Fox"
 * 2. Do not end the expression with a full stop
 *      -> "The quick brown fox" not "The quick brown fox."
 * 3. Express required actions (only when appropriate, taking brevity into consideration)
 *      -> "Failed to fetch data, please refresh and try again"     - GOOD
 *      -> "Failed to fetch data, refresh and try again and make sure wallet is connected"      - BAD: Too long
 */

export const TOASTS = {
  pay: {
    error: {
      missingData: {
        variant: "destructive",
        title: "Error",
        description: "Required data is missing, refresh and try again",
      },
      transactionReverted: {
        variant: "destructive",
        title: "Error",
        description: "Transaction reverted",
      },
    },
    success: {
      contribution: (amount: string, symbol: string): ToastMessage => ({
        title: "Success",
        description: `Your contribution of ${amount} ${symbol} was successful`,
      }),
    },
  },

  withdraw: {
    error: {
      prepareFailed: {
        variant: "destructive",
        title: "Error preparing transaction",
        description: "Failed to prepare your transaction, refresh and try again",
      },
      cashoutsLocked: (unlocksIn: string): ToastMessage => ({
        variant: "destructive",
        title: "Cashouts unavailable",
        description: `Cashouts unlock in ${unlocksIn}`,
      }),
      transactionReverted: {
        variant: "destructive",
        title: "Error",
        description: "Transaction reverted",
      },
    },
    success: {
      withdrawn: {
        title: "Withdraw successful",
        description: "You successfully withdrew your tokens",
      },
    },
  },

  loan: {
    error: {
      clientError: {
        variant: "destructive",
        title: "Client error",
        description:
          "Couldn't start the borrow process, please refresh and try again",
      },
      permissionReverted: {
        variant: "destructive",
        title: "Transaction reverted",
        description: "Loan creation reverted on chain",
      },
      quoteChanged: {
        variant: "destructive",
        title: "Quote changed",
        description:
          "The amount you can borrow dropped since your quote. Please review the new amount and try again",
      },
      borrowReverted: {
        variant: "destructive",
        title: "Transaction reverted",
        description: "Loan creation reverted on chain",
      },
      borrowCancelled: {
        variant: "destructive",
        title: "Transaction cancelled",
        description: "Loan creation was cancelled",
      },
      borrowFailed: (walletError: string): ToastMessage => ({
        variant: "destructive",
        title: "Borrow failed",
        description: walletError,
      }),
    },
    success: {
      loanCreated: {
        title: "Loan created",
        description: "Loan was successfully created",
      },
    },
  },

  repay: {
    error: {
      clientError: {
        variant: "destructive",
        title: "Client error",
        description:
          "Couldn't start the repayment, please refresh and try again",
      },
      remainingExceedsLoan: {
        variant: "destructive",
        title: "Cannot repay",
        description:
          "Your remaining collateral covers more than the loan. Unlock more collateral or refinance instead",
      },
      approvalReverted: {
        variant: "destructive",
        title: "Transaction reverted",
        description: "Token approval reverted on chain",
      },
      approvalCancelled: {
        variant: "destructive",
        title: "Transaction cancelled",
        description: "Token approval was cancelled",
      },
      repayReverted: {
        variant: "destructive",
        title: "Transaction reverted",
        description: "Loan repayment reverted on chain",
      },
      repayCancelled: {
        variant: "destructive",
        title: "Transaction cancelled",
        description: "Loan repayment was cancelled",
      },
      repayFailed: (walletError: string): ToastMessage => ({
        variant: "destructive",
        title: "Repayment failed",
        description: walletError,
      }),
    },
    success: {
      loanRepaid: {
        title: "Loan repaid",
        description: "Successfully repaid loan and unlocked collateral",
      },
    },
  },

  refinance: {
    error: {
      clientError: {
        variant: "destructive",
        title: "Client error",
        description:
          "Couldn't start the refinance, please refresh and try again",
      },
      permissionReverted: {
        variant: "destructive",
        title: "Transaction reverted",
        description: "Permission grant reverted on chain",
      },
      permissionCancelled: {
        variant: "destructive",
        title: "Transaction cancelled",
        description: "Permission grant was cancelled",
      },
      quoteChanged: {
        variant: "destructive",
        title: "Quote changed",
        description:
          "The amount you can borrow dropped since your quote. Please review the new amount and try again",
      },
      refinanceReverted: {
        variant: "destructive",
        title: "Transaction reverted",
        description: "Loan refinance reverted on chain",
      },
      refinanceCancelled: {
        variant: "destructive",
        title: "Transaction cancelled",
        description: "Loan refinance was cancelled",
      },
      refinanceFailed: (walletError: string): ToastMessage => ({
        variant: "destructive",
        title: "Refinance failed",
        description: walletError,
      }),
    },
    success: {
      loanRefinanced: {
        title: "Loan refinanced",
        description: "Successfully refinanced loan",
      },
    },
  },
} as const;
