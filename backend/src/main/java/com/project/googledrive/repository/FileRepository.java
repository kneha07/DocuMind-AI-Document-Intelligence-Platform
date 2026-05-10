package com.project.googledrive.repository;

import com.project.googledrive.model.FileMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FileRepository extends MongoRepository<FileMetadata, String> {
    List<FileMetadata> findByOwnerEmail(String ownerEmail);
    List<FileMetadata> findBySharedWithContaining(String email);
}