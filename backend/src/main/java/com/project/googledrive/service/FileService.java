package com.project.googledrive.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.project.googledrive.model.FileMetadata;
import com.project.googledrive.repository.FileRepository;
import com.project.googledrive.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {
    
    private final FileRepository fileRepository;
    private final AmazonS3 amazonS3;
    private final OpenAIService openAIService;
    private final ClaudeService claudeService;
    private final KeywordExtractionService keywordExtractionService;
    private final DocumentSummaryService documentSummaryService;
    
    @Value("${aws.s3.bucket.name}")
    private String bucketName;
    
    private final Tika tika = new Tika();
    
    // Storage limit: 15 GB in bytes
    private static final long STORAGE_LIMIT = 15L * 1024 * 1024 * 1024; // 15 GB
    
    public FileMetadata uploadFile(MultipartFile file, String ownerEmail) throws Exception {
        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        
        // Check storage limit before upload
        long currentStorage = getTotalStorageUsed(ownerEmail);
        long newFileSize = file.getSize();
        
        if (currentStorage + newFileSize > STORAGE_LIMIT) {
            long availableSpace = STORAGE_LIMIT - currentStorage;
            throw new RuntimeException(
                "Storage limit exceeded! You have " + 
                (availableSpace / (1024 * 1024)) + " MB available, but file is " + 
                (newFileSize / (1024 * 1024)) + " MB"
            );
        }
        
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName;
        
        // Generate encryption key
        String encryptionKey = EncryptionUtil.generateKey();
        
        // Encrypt file data
        byte[] fileData = file.getBytes();
        byte[] encryptedData = EncryptionUtil.encrypt(fileData, encryptionKey);
        
        // Prepare S3 metadata
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(encryptedData.length);
        metadata.setContentType(file.getContentType());
        
        // Upload to S3
        ByteArrayInputStream inputStream = new ByteArrayInputStream(encryptedData);
        PutObjectRequest putObjectRequest = new PutObjectRequest(
                bucketName, 
                fileName, 
                inputStream, 
                metadata
        );
        
        amazonS3.putObject(putObjectRequest);
        
        // Generate embedding, keywords, and summary for text-based files only
        List<Double> embedding = null;
        List<String> keywords = null;
        String summary = null;
        
        if (isTextBasedFile(file.getContentType())) {
            try {
                String extractedText = extractText(fileData, file.getContentType());
                if (extractedText != null && !extractedText.trim().isEmpty()) {
                    // Limit text to first 8000 characters to avoid token limits
                    String textForEmbedding = extractedText.length() > 8000 
                        ? extractedText.substring(0, 8000) 
                        : extractedText;
                    
                    // Generate embedding
                    embedding = openAIService.generateEmbedding(textForEmbedding);
                    log.info("Generated embedding for: {}", originalFileName);

                    keywords = keywordExtractionService.extractKeywords(extractedText);
                    log.info("Extracted keywords for: {} -> {}", originalFileName, keywords);

                    summary = documentSummaryService.generateSummary(extractedText);
                    log.info("Generated summary for: {}", originalFileName);
                }
            } catch (Exception e) {
                log.warn("NLP processing failed for {}, uploading without AI features: {}", originalFileName, e.getMessage());
            }
        }
        // Images don't get any NLP processing
        
        // Save metadata to database
        FileMetadata fileMetadata = new FileMetadata();
        fileMetadata.setFileName(fileName);
        fileMetadata.setOriginalFileName(originalFileName);
        fileMetadata.setFileType(file.getContentType());
        fileMetadata.setFileSize(file.getSize());
        fileMetadata.setFilePath("s3://" + bucketName + "/" + fileName);
        fileMetadata.setOwnerEmail(ownerEmail);
        fileMetadata.setUploadedAt(LocalDateTime.now());
        fileMetadata.setEncryptionKey(encryptionKey);
        fileMetadata.setEmbedding(embedding);
        fileMetadata.setKeywords(keywords != null ? keywords : List.of());
        fileMetadata.setSummary(summary != null ? summary : "");
        
        return fileRepository.save(fileMetadata);
    }
    
    // Check if file is text-based (for embedding generation)
    private boolean isTextBasedFile(String contentType) {
        return contentType != null && (
            contentType.contains("pdf") ||
            contentType.contains("text") ||
            contentType.contains("document") ||
            contentType.contains("msword") ||
            contentType.contains("officedocument")
        );
    }
    
    // Extract text from files using Apache Tika
    private String extractText(byte[] fileData, String contentType) {
        try {
            String text = tika.parseToString(new ByteArrayInputStream(fileData));
            return text != null ? text.trim() : "";
        } catch (Exception e) {
            log.error("Text extraction failed: {}", e.getMessage());
            return "";
        }
    }
    
    // Calculate total storage used by user
    private long getTotalStorageUsed(String ownerEmail) {
        List<FileMetadata> userFiles = fileRepository.findByOwnerEmail(ownerEmail);
        return userFiles.stream()
                .mapToLong(FileMetadata::getFileSize)
                .sum();
    }
    
    // Semantic search using OpenAI embeddings
    public List<FileMetadata> searchBySemanticQuery(String query, String userEmail) throws Exception {
        // Generate embedding for the search query
        List<Double> queryEmbedding = openAIService.generateEmbedding(query);
        
        // Get all user's files
        List<FileMetadata> allFiles = getUserFiles(userEmail);
        
        // Calculate similarity scores and return top matches
        class FileWithScore {
            FileMetadata file;
            double score;
            FileWithScore(FileMetadata file, double score) {
                this.file = file;
                this.score = score;
            }
        }
        
        return allFiles.stream()
                .filter(file -> file.getEmbedding() != null && !file.getEmbedding().isEmpty())
                .map(file -> new FileWithScore(file, openAIService.calculateSimilarity(queryEmbedding, file.getEmbedding())))
                .filter(item -> item.score > 0.78) // Only return results with >78% similarity
                .sorted((a, b) -> Double.compare(b.score, a.score)) // Sort by relevance
                .limit(3)
                .map(item -> item.file)
                .collect(Collectors.toList());
    }
    
    public List<FileMetadata> getUserFiles(String ownerEmail) {
        // Get files owned by user
        List<FileMetadata> ownedFiles = fileRepository.findByOwnerEmail(ownerEmail);
        
        // Get files shared with user
        List<FileMetadata> sharedFiles = getSharedFiles(ownerEmail);
        
        // Combine both lists
        ownedFiles.addAll(sharedFiles);
        
        return ownedFiles;
    }
    
    public byte[] downloadFile(String fileId) throws Exception {
        FileMetadata metadata = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        // Download from S3
        S3Object s3Object = amazonS3.getObject(bucketName, metadata.getFileName());
        S3ObjectInputStream inputStream = s3Object.getObjectContent();
        byte[] encryptedData = inputStream.readAllBytes();
        inputStream.close();
        
        // Decrypt and return
        return EncryptionUtil.decrypt(encryptedData, metadata.getEncryptionKey());
    }
    
    public int reprocessAllFiles() {
        List<FileMetadata> files = fileRepository.findAll();
        int processed = 0;
        for (FileMetadata metadata : files) {
            if (!isTextBasedFile(metadata.getFileType())) continue;
            if (metadata.getKeywords() != null && !metadata.getKeywords().isEmpty() && metadata.getSummary() != null && !metadata.getSummary().isBlank()) continue;
            try {
                byte[] fileData = downloadFile(metadata.getId());
                String text = extractText(fileData, metadata.getFileType());
                if (text == null || text.trim().isEmpty()) continue;
                metadata.setKeywords(keywordExtractionService.extractKeywords(text));
                Thread.sleep(1500); // avoid Gemini rate limit
                metadata.setSummary(documentSummaryService.generateSummary(text));
                fileRepository.save(metadata);
                log.info("Reprocessed: {}", metadata.getOriginalFileName());
                processed++;
                Thread.sleep(1000);
            } catch (Exception e) {
                log.warn("Reprocess failed for {}: {}", metadata.getOriginalFileName(), e.getMessage());
            }
        }
        return processed;
    }

    public void deleteFile(String fileId) throws Exception {
        FileMetadata metadata = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        // Delete from S3
        amazonS3.deleteObject(bucketName, metadata.getFileName());
        
        // Delete metadata from database
        fileRepository.deleteById(fileId);
    }

    public FileMetadata shareFile(String fileId, String shareWithEmail, String ownerEmail) throws Exception {
        FileMetadata metadata = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        // Check if the requester is the owner
        if (!metadata.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("You don't have permission to share this file");
        }
        
        // Check if already shared with this user
        if (metadata.getSharedWith().contains(shareWithEmail)) {
            throw new RuntimeException("File already shared with this user");
        }
        
        // Add to shared list
        metadata.getSharedWith().add(shareWithEmail);
        
        return fileRepository.save(metadata);
    }

    public String answerFromDocuments(String query, String userEmail) throws Exception {
        List<Double> queryEmbedding = openAIService.generateEmbedding(query);
        List<FileMetadata> allFiles = getUserFiles(userEmail);

        List<String> relevantSummaries = allFiles.stream()
                .filter(f -> f.getEmbedding() != null && !f.getEmbedding().isEmpty())
                .filter(f -> openAIService.calculateSimilarity(queryEmbedding, f.getEmbedding()) > 0.72)
                .sorted((a, b) -> Double.compare(
                        openAIService.calculateSimilarity(queryEmbedding, b.getEmbedding()),
                        openAIService.calculateSimilarity(queryEmbedding, a.getEmbedding())))
                .limit(3)
                .filter(f -> f.getSummary() != null && !f.getSummary().isEmpty())
                .map(f -> "Document: " + f.getOriginalFileName() + "\nSummary: " + f.getSummary())
                .toList();

        if (relevantSummaries.isEmpty()) {
            return null;
        }

        String context = String.join("\n\n", relevantSummaries);
        String prompt = "Based on these document summaries, answer the user's question concisely in 2-3 sentences.\n\n"
                + context + "\n\nQuestion: " + query;

        return claudeService.chat(
                "You are a helpful document assistant. Answer questions based only on the provided document summaries. Be concise and specific.",
                prompt,
                200
        );
    }

    public List<FileMetadata> getSharedFiles(String userEmail) {
        return fileRepository.findBySharedWithContaining(userEmail);
    }
    
    // Rename File
    public FileMetadata renameFile(String fileId, String newFileName, String userEmail) throws Exception {
        FileMetadata metadata = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        // Check if user is the owner
        if (!metadata.getOwnerEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have permission to rename this file");
        }
        
        // Update the original file name
        metadata.setOriginalFileName(newFileName);
        
        return fileRepository.save(metadata);
    }
}