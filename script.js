'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovments = function (movements, sort = false) {
  // Empty the container to add new elements
  containerMovements.innerHTML = '';

  // creates a copy of array using slice to display sorted list
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov}€</div>
    </div>`;

    //        check out mdn for container movement
    // afterbegin is being used to help with the order of each deposit or withdrawal
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// For the current balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance} EUR`;
};

// For the In at the bottom
const calcDisplaySummery = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  // For the OUT at the bottom
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  // For the interest at the bottom
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

///////////////////////////////////////////////////////
// Create username
const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

const updateUI = function (acc) {
  // Display Movements
  displayMovments(acc.movements);

  // Display balance
  calcDisplayBalance(acc);
  // Display Summery
  calcDisplaySummery(acc);
};

////////////////////////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  //Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  // The question mark also checks if the current account also exists and then the pin
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and a Welcome message
    labelWelcome.textContent = `Welcome Back ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;

    // Clear the input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    // Make login button lose its focus
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});
// Balance transfer Feature
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////
// Request a loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add Movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

//////////////////////////////////////////////////////////////////////////////////////////
// Closing the account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // .index(23)
    console.log(index);
    //Delete Account
    accounts.splice(index, 1);
    //Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

/////////////////////////////////////////////////////////////////////////////////////////////
// Building the Sort button on bottom of application

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovments(currentAccount.movements, !sorted);
  sorted = !sorted;
});

///////////////////////////////////////////////////////////////////////////////////////////

// // Array method practice
// // 1.
// const bankDepositsSum = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((sum, cur) => sum + cur, 0);
// console.log(bankDepositsSum);

// // 2. - deposits over 1000 dollars - 5
// const numDepositis1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000).length;

// // The reduce method to do the same as filter above
// //   .reduce((count, cur) => (cur >= 1000 ? count + 1 : count), 0);
// console.log(numDepositis1000);

// // 3 - all deposits and all withdrawls total for each
// const { deposits, withdrawls } = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       // cur > 0 ? (sums.deposits += cur) : (sums.withdrawls += cur);
//       sums[cur > 0 ? 'deposits' : 'withdrawls'] += cur;
//       return sums;
//     },
//     { deposits: 0, withdrawls: 0 }
//   );
// console.log(deposits, withdrawls);

// // 4. convert any string to title case

// const convertTitleCase = function (title) {
//   const capitalize = str => str[0].toUpperCase() + str.slice(1);

//   const exceptions = ['a', 'an', 'the', 'and', 'but', 'or', 'on', 'in', 'with'];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exceptions.includes(word) ? word : capitalize(word)))
//     .join(' ');
//   return capitalize(titleCase);
// };

// console.log(convertTitleCase('this is a nice title'));
// console.log(convertTitleCase('this is a LONG title but not too long'));

// The challange #4

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1.
const str = ' kg';
dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));
console.log(dogs);

// 2.
const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(dogSarah);
console.log(
  `Sara's dog is eating ${
    dogSarah.curFood > dogSarah.recFood ? 'To much' : 'To little'
  }`
);

// 3.
const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooLittle);

// 4.
// "Matilda and
// Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat
// too little!"

console.log(
  `${ownersEatTooMuch.join(
    ' and '
  )}'s dogs eat to much! and ${ownersEatTooLittle.join(
    ' and '
  )}'s dogs eat too little!`
);

// 5.
console.log(dogs.some(dog => dog.curFood === dog.recFood));

// 6.

const checkEatingOk = dog =>
  dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;

console.log(dogs.some(checkEatingOk));

// 7.

console.log(dogs.filter(checkEatingOk));

// 8.
const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);

console.log(dogsSorted);

// not the best with mixed numbers and strings array

// const owners = ['Jonas', 'Zack', 'Adam', 'Martha'];
// owners.sort();
// console.log(owners);

// console.log(movements);

// // Return < 0 a,b (keep order)
// // Return > 0 b,a (switch order)

// // Ascending
// movements.sort((a, b) => a - b);
// console.log(movements);
// // Desendeing
// movements.sort((a, b) => b - a);

// console.log(movements);

// const overAllBalance = accounts
//   .flatMap(acc => acc.movements)
//   .flat()
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overAllBalance);

// converting the money to usd
// const euroToUsd = 1.1;

// const totalDepositsUSD = movements
//   // converted all deposits to USD
//   .filter(mov => mov > 0)
//   // Puts values in new array
//   .map(mov => mov * euroToUsd)
//   // converts values to single value
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(totalDepositsUSD);

//////////////////////////////////////////////

// The find method

// const firstWiddrawl = movements.find(mov => mov < 0);
// console.log(firstWiddrawl);

// const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);

/////////////////////////////////////////////

//const currencies = new Map([
//  ['USD', 'United States dollar'],
//  ['EUR', 'Euro'],
//  ['GBP', 'Pound sterling'],
//]);
//
//currencies.forEach(function(value,key,map){
//    console.log(`${key}: ${value}`)
//})
//
////now with a set - no duplications
//
//const currenciesUnique = new Set(['USD', 'GBP','USD','EUR','EUR']);
//
//console.log(currenciesUnique);
//
////the key and value are the same and makes no sense- but still kept the same so watch out- throwaway variable - '-'
//currenciesUnique.forEach(function(value,_,map){
//    console.log(`${value}:${value}`)
//})

// const Julia = [3, 5, 2, 12, 7];
// const Kate = [4, 1, 15, 8, 3];

// const checkDogs = function (dogsJulia, dogsKate) {
//   const dogsJuliaCorrected = Julia.slice(1, 3);

//   console.log(dogsJuliaCorrected);

//   const dogs = dogsJuliaCorrected.concat(Kate);
//   console.log(dogs);

//   dogs.forEach(function (dog, i) {
//     if (dog >= 3) {
//       console.log(`Dogs number ${i + 1} is an adult, and is ${dog} years old`);
//     } else {
//       console.log(`Dog number ${i + 1} is still a puppy`);
//     }
//   });
// };
// checkDogs();

// const myAccount1 = {
//   name: 'Steve D Larkin',
//   age: 34,
// };

// const myAccount2 = {
//   name: 'Sam A Stanko',
//   age: 32,
// };

// const ourAccounts = [myAccount1, myAccount2];

// const nickName = function (accounts) {
//   accounts.forEach(function (account) {
//     account.name = account.name
//       .toLowerCase()
//       .split(' ')
//       .map(name => name[0])
//       .join('');
//   });
// };

// nickName(ourAccounts);

// console.log(ourAccounts);

// const calcPrintBalance = function (movements) {
//   const balance = movements.reduce((acc, mov) => acc + mov, 0);
//   labelBalance.textContent = `${balance} EUR`;
// };
// calcPrintBalance(account1.movements);
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// console.log(calcPrintBalance);

// // Getting now the Max value in the movements array
// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) return acc;
//   else return mov;
// }, movements[0]);
// console.log(max);

// const ages = [5, 2, 4, 1, 15, 8, 3];
// const ages2 = [16, 6, 10, 6, 1, 4];

// const calcAverageHumanAge = function (ages) {
//   const humanAges = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
//   const oldEnoughDogs = humanAges.filter(function (mov) {
//     return mov >= 18;
//   });
//   const average =
//     oldEnoughDogs.reduce((acc, age) => acc + age, 0) / oldEnoughDogs.length;
//   console.log(humanAges);
//   console.log(oldEnoughDogs);
//   console.log(average);
// };
// calcAverageHumanAge(ages);
// calcAverageHumanAge(ages2);
