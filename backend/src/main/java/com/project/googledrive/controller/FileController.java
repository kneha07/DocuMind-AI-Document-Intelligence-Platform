package com.project.googledrive.controller;

import com.project.googledrive.model.FileMetadata;
import com.project.googledrive.service.FileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    
    private final FileService fileService;
    
    @PostMapping("/upload")
    public ResponseEntity<FileMetadata> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String ownerEmail = authentication.getName();
            FileMetadata metadata = fileService.uploadFile(file, ownerEmail);
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<FileMetadata>> getUserFiles(Authentication authentication) {
        String ownerEmail = authentication.getName();
        List<FileMetadata> files = fileService.getUserFiles(ownerEmail);
        return ResponseEntity.ok(files);
    }
    
    @GetMapping("/download/{fileId}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable String fileId) {
        try {
            byte[] data = fileService.downloadFile(fileId);
            ByteArrayResource resource = new ByteArrayResource(data);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable String fileId) {
        try {
            fileService.deleteFile(fileId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // For file sharing
    @PostMapping("/share")
    public ResponseEntity<FileMetadata> shareFile(
            @RequestBody @Valid com.project.googledrive.dto.ShareRequest shareRequest,
            Authentication authentication) {
        try {
            String ownerEmail = authentication.getName();
            FileMetadata metadata = fileService.shareFile(
                shareRequest.getFileId(),
                shareRequest.getShareWithEmail(),
                ownerEmail
            );
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // File Rename
    @PutMapping("/rename/{fileId}")
    public ResponseEntity<FileMetadata> renameFile(
            @PathVariable String fileId,
            @RequestParam String newFileName,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            FileMetadata renamedFile = fileService.renameFile(fileId, newFileName, userEmail);
            return ResponseEntity.ok(renamedFile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // AI Answer — returns a Claude-generated answer from relevant document summaries
    @GetMapping("/search/ai/answer")
    public ResponseEntity<String> aiAnswer(
            @RequestParam String query,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            String answer = fileService.answerFromDocuments(query, userEmail);
            if (answer == null) return ResponseEntity.noContent().build();
            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // AI Search
    @GetMapping("/search/ai")
    public ResponseEntity<List<FileMetadata>> aiSearch(
            @RequestParam String query,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<FileMetadata> results = fileService.searchBySemanticQuery(query, userEmail);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}