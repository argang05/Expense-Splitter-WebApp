package com.example.expenseSplitterApp.services;

import com.example.expenseSplitterApp.utils.CustomMultipartFile;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service
public class ImageCompressionService {

    public MultipartFile compressImage(MultipartFile image) {
        try {
            // Check original file size
            final long maxSizeInBytes = 11 * 1024 * 1024; // 10MB
            if (image.getSize() <= maxSizeInBytes) {
                return image; // No compression needed
            }

            // Convert MultipartFile to BufferedImage
            BufferedImage originalImage = ImageIO.read(image.getInputStream());

            // Calculate compression ratio
            double compressionRatio = Math.sqrt((double) maxSizeInBytes / image.getSize());

            // Compress the image using Thumbnailator
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(originalImage)
                    .scale(compressionRatio)
                    .outputFormat("jpg")// Scale down image dimensions
                    .outputQuality(0.8)     // Adjust JPEG quality (80%)
                    .toOutputStream(outputStream);

            // Convert compressed image to MultipartFile
            ByteArrayInputStream inputStream = new ByteArrayInputStream(outputStream.toByteArray());
            MultipartFile compressedImage = new CustomMultipartFile(inputStream, image.getOriginalFilename(),
                    image.getContentType(), outputStream.toByteArray().length);

            return compressedImage;
        } catch (Exception e) {
            throw new RuntimeException("Error compressing image", e);
        }
    }
}
