import React from 'react';
import {
  Flex,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TransactionForm from 'components/Forms/TransactionForm';
import { useTransactions } from 'contexts/TransactionContext';

const AddTransaction = () => {
  const { addTransaction } = useTransactions();
  const toast = useToast();
  const textColor = useColorModeValue("gray.700", "white");

  const handleFormSubmit = async (formData) => {
    try {
      // Add transaction to context
      const newTransaction = await addTransaction(formData);
      
      console.log('Transaction Added:', newTransaction);
      
      // Show success message
      toast({
        title: 'Transaction Added',
        description: `${formData.type === 'income' ? 'Income' : 'Expense'} of ${formData.currency || 'USD'} ${formData.amount} has been added successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add transaction. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFormCancel = () => {
    // Reset form or navigate back if needed
    console.log('Form cancelled');
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Flex justify="center" px={6}>
        <Card maxW="600px" w="100%">
          <CardHeader p="6px 0px 22px 0px">
            <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign="center">
              Add New Transaction
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
              Enter transaction details to track your income and expenses
            </Text>
          </CardHeader>
          <CardBody>
            <Flex justify="center">
              <TransactionForm
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </Flex>
          </CardBody>
        </Card>
      </Flex>
    </Flex>
  );
};

export default AddTransaction;
