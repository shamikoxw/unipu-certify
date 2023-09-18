// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AcademicCertificate is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    address public admin;

    struct Certificate {
        string uri;
        string ipfsHash;
        string universityName;
        string certificateType;
        string certificateDate;
    }

    Certificate[] public certificates;

    uint256 public totalCertificates;

    constructor() ERC721("AcademicCertificate", "ACERT") {
        admin = msg.sender; // Set the admin to the contract deployer
    }

    function mint(
        address to,
        string memory uri,
        string memory ipfsHash,
        string memory universityName,
        string memory certificateType,
        string memory certificateDate
    ) external onlyOwner {
        require(msg.sender == admin, "Only admin can mint");

        certificates.push(Certificate(uri, ipfsHash, universityName, certificateType, certificateDate));
        uint256 newCertificateId = _tokenIdCounter.current();
        _mint(to, newCertificateId);
        _setTokenURI(newCertificateId, uri);
        _tokenIdCounter.increment();
        totalCertificates++;
    }

    function getAdmin() external view returns (address) {
        return admin;
    }


    function getCertificateURI(uint256 tokenId) external view returns (string memory) {
        return certificates[tokenId].uri;
    }

    function getOwnerOfToken(uint256 tokenId) external view returns (address) {
        return ownerOf(tokenId);
}

}
