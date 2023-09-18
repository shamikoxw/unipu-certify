pragma solidity >=0.7.0 <0.9.0;

contract Marketplace {

    //name (string): the name of the item
    //description (string): a description of the item
    //price (uint): the price of the item in wei
    //seller (address): the address of the seller

    struct Item{
    string  name;
    string  description;
    uint  price;
    address  seller;
    bool isSold;
    }

    mapping(uint => Item) public items;
    uint public itemCount;
    /*
    Write a function for adding a new item to the marketplace. 
    This function should take in the name, description, and price of the item, and add it to the mapping of items.
    The seller should be set as the address of the person who called the function
    */
    function addItem(string memory name, string memory description, uint256 price) public {
        itemCount++;
        items[itemCount] = Item(name, description, price, msg.sender, false);
    }
    /*
    Write a function for buying an item from the marketplace. 
    This function should take in the ID of the item being purchased, 
    and transfer the appropriate amount of cryptocurrency from the buyer to the seller. 
    The item should then be removed from the mapping of items.
    */
    function buyItem(uint item_ID) public payable {
        require(item_ID > 0 && item_ID <= itemCount, "Invalid item ID!");
        Item storage item = items[item_ID];
        require(!item.isSold, "SOLD OUT!");
        require(msg.value >= item.price, "Nedovoljno soldi!");

        address payable seller = payable(item.seller);
        seller.transfer(item.price);

        //Return the difference
        if (msg.value > item.price) {
            address payable buyer = payable(msg.sender);
            buyer.transfer(msg.value - item.price);
        }
        item.isSold = true;

    }
    modifier onlySeller(uint item_ID) {
        require(items[item_ID].seller == msg.sender, "Only seller can remove the item!");
        _;
    }

    /*
    Write a function for removing an item from the marketplace. 
    This function should only be callable by the seller of the item, 
    and should remove the item from the mapping of items
    */
    function removeItem(uint item_ID) public onlySeller(item_ID) {
        require(!items[item_ID].isSold, "Cannot remove, its already been sold");
        delete items[item_ID];
    }

    function getItemDetails(uint item_ID)
        public
        view
        returns (
            string memory name,
            string memory description,
            uint256 price,
            address seller
        )
    {
        Item storage item = items[item_ID];
        require(!item.isSold, "Item is already sold");
        return (item.name, item.description, item.price, item.seller);
    }

//Write a function for retrieving the number of items currently for sale on the marketplace.
    function getItemsForSaleCount() public view returns (uint) {
        uint itemsForSaleCount = 0;
        for (uint i = 1; i <= itemCount; i++) {
            if (!items[i].isSold) {
                itemsForSaleCount++;
            }
        }
        return itemsForSaleCount;
    }
}

