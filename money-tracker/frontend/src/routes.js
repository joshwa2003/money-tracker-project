// import
import React, { Component }  from 'react';
import Dashboard from "views/Dashboard/Dashboard.js";
import Tables from "views/Dashboard/Tables.js";
import Billing from "views/Dashboard/Billing.js";
import Profile from "views/Dashboard/Profile.js";
import AddTransaction from "views/Dashboard/AddTransaction.js";
import Categories from "views/Dashboard/Categories.js";
import TransactionChart from "views/Dashboard/TransactionChart.js";
import SavingsGoals from "views/Dashboard/SavingsGoals.js";
import SignIn from "views/Pages/SignIn.js";
import SignUp from "views/Pages/SignUp.js";

import {
  HomeIcon,
  StatsIcon,
  CreditIcon,
  PersonIcon,
  DocumentIcon,
  RocketIcon,
} from "components/Icons/Icons";

var dashRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color='inherit' />,
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Tables",
    icon: <StatsIcon color='inherit' />,
    component: Tables,
    layout: "/admin",
  },
  {
    path: "/billing",
    name: "Billing",
    icon: <CreditIcon color='inherit' />,
    component: Billing,
    layout: "/admin",
  },
  {
    path: "/add-transaction",
    name: "Add Transaction",
    icon: <DocumentIcon color='inherit' />,
    component: AddTransaction,
    layout: "/admin",
  },
  {
    path: "/categories",
    name: "Categories",
    icon: <StatsIcon color='inherit' />,
    component: Categories,
    layout: "/admin",
  },
  {
    path: "/transaction-chart",
    name: "Transaction Chart",
    icon: <StatsIcon color='inherit' />,
    component: TransactionChart,
    layout: "/admin",
  },
  {
    path: "/savings-goals",
    name: "Savings Goals",
    icon: <RocketIcon color='inherit' />,
    component: SavingsGoals,
    layout: "/admin",
  },
  {
    name: "ACCOUNT PAGES",
    category: "account",
    state: "pageCollapse",
    views: [
      {
        path: "/profile",
        name: "Profile",
        icon: <PersonIcon color='inherit' />,
        secondaryNavbar: true,
        component: Profile,
        layout: "/admin",
      },
      {
        path: "/signin",
        name: "Sign In",
        icon: <DocumentIcon color='inherit' />,
        component: SignIn,
        layout: "/auth",
      },
      {
        path: "/signup",
        name: "Sign Up",
        icon: <RocketIcon color='inherit' />,
        component: SignUp,
        layout: "/auth",
      },
    ],
  },
];
export default dashRoutes;
