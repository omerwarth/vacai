#!/bin/bash

# Azure Cosmos DB - Create Itinerary Container
# Run this script to create the itineraries container via Azure CLI

set -e  # Exit on error

echo "🚀 Creating Itinerary Container in Cosmos DB"
echo "=============================================="
echo ""

# Configuration - UPDATE THESE VALUES
SUBSCRIPTION_ID="YOUR_SUBSCRIPTION_ID"
RESOURCE_GROUP="YOUR_RESOURCE_GROUP"
COSMOS_ACCOUNT_NAME="YOUR_COSMOS_ACCOUNT_NAME"
DATABASE_NAME="capgemini-hospitality"
CONTAINER_NAME="itineraries"
PARTITION_KEY="/userId"
THROUGHPUT=400

echo "Configuration:"
echo "  Subscription: $SUBSCRIPTION_ID"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Cosmos Account: $COSMOS_ACCOUNT_NAME"
echo "  Database: $DATABASE_NAME"
echo "  Container: $CONTAINER_NAME"
echo "  Partition Key: $PARTITION_KEY"
echo "  Throughput: $THROUGHPUT RU/s"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed"
    echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

echo "✅ Azure CLI found"
echo ""

# Login to Azure
echo "📝 Logging in to Azure..."
az login

# Set subscription
echo "📝 Setting subscription..."
az account set --subscription "$SUBSCRIPTION_ID"

# Verify the database exists
echo "📝 Checking if database exists..."
DATABASE_EXISTS=$(az cosmosdb sql database show \
    --account-name "$COSMOS_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DATABASE_NAME" \
    --query "id" -o tsv 2>/dev/null || echo "")

if [ -z "$DATABASE_EXISTS" ]; then
    echo "❌ Database '$DATABASE_NAME' does not exist"
    echo "Creating database..."
    az cosmosdb sql database create \
        --account-name "$COSMOS_ACCOUNT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DATABASE_NAME"
    echo "✅ Database created"
else
    echo "✅ Database exists"
fi

# Check if container already exists
echo "📝 Checking if container exists..."
CONTAINER_EXISTS=$(az cosmosdb sql container show \
    --account-name "$COSMOS_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --database-name "$DATABASE_NAME" \
    --name "$CONTAINER_NAME" \
    --query "id" -o tsv 2>/dev/null || echo "")

if [ -n "$CONTAINER_EXISTS" ]; then
    echo "⚠️  Container '$CONTAINER_NAME' already exists"
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Deleting existing container..."
        az cosmosdb sql container delete \
            --account-name "$COSMOS_ACCOUNT_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --database-name "$DATABASE_NAME" \
            --name "$CONTAINER_NAME" \
            --yes
        echo "✅ Container deleted"
    else
        echo "Skipping container creation"
        exit 0
    fi
fi

# Create the container
echo "📝 Creating container '$CONTAINER_NAME'..."
az cosmosdb sql container create \
    --account-name "$COSMOS_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --database-name "$DATABASE_NAME" \
    --name "$CONTAINER_NAME" \
    --partition-key-path "$PARTITION_KEY" \
    --throughput "$THROUGHPUT"

echo ""
echo "✅ Container created successfully!"
echo ""
echo "📊 Container Details:"
az cosmosdb sql container show \
    --account-name "$COSMOS_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --database-name "$DATABASE_NAME" \
    --name "$CONTAINER_NAME" \
    --query "{id:id, partitionKey:partitionKey, throughput:resource.throughput}" \
    -o table

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Implement Azure Functions endpoints (see BACKEND_SETUP.md)"
echo "2. Test endpoints with curl (see README-ITINERARY.md)"
echo "3. Verify in Azure Portal: Cosmos DB > Data Explorer > $DATABASE_NAME > $CONTAINER_NAME"
echo ""
