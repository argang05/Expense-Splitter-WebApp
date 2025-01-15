package com.example.expenseSplitterApp.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

public class CustomMultipartFile implements MultipartFile {
    private final ByteArrayInputStream inputStream;
    private final String originalFilename;
    private final String contentType;
    private final long size;

    public CustomMultipartFile(ByteArrayInputStream inputStream, String originalFilename, String contentType, long size) {
        this.inputStream = inputStream;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.size = size;
    }

    @Override
    public String getName() {
        return originalFilename;
    }

    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public long getSize() {
        return size;
    }

    @Override
    public byte[] getBytes() {
        return inputStream.readAllBytes();
    }

    @Override
    public InputStream getInputStream() {
        return inputStream;
    }

    @Override
    public void transferTo(java.io.File dest) {
        throw new UnsupportedOperationException("CustomMultipartFile does not support file transfer.");
    }
}
