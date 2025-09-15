import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Flex
} from '@chakra-ui/react';
import CategoryManager from 'components/Categories/CategoryManager';

const Categories = () => {
  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Page Header */}
      <Box textAlign="center" w="100%" mb={6}>
        <Heading size="xl" mb={2}>
          Expense Categories
        </Heading>
        <Text color="gray.500" fontSize="lg">
          Manage your income and expense categories
        </Text>
      </Box>

      {/* Category Manager Component */}
      <CategoryManager />
    </Flex>
  );
};

export default Categories;
