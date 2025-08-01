import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
    Volume2, 
    VolumeX, 
    Play, 
    ArrowLeft,
} from 'lucide-react';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';
import { Button, Grid, Badge, Text, Heading, Container } from '../../components/components';
import LoadingSpinner from '../../components/LoadingSpinner';

function AdDetails() {
    const { adId } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState(null);
    const [filteredAds, setFilteredAds] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmingWebsite, setConfirmingWebsite] = useState(null);
    const [muted, setMuted] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const videoRef = useRef(null);
    const [selectedWebsiteId, setSelectedWebsiteId] = useState(null);

    useEffect(() => {
        const fetchAdDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const adResponse = await axios.get(`http://localhost:5000/api/web-advertise/ad-details/${adId}`);
                setAd(adResponse.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load ad details');
            } finally {
                setLoading(false);
            }
        };

        if (adId) {
            fetchAdDetails();
        }
    }, [adId]);

    const toggleMute = (e) => {
        e.stopPropagation();
        setMuted(!muted);
    };

    const togglePause = () => {
        if (videoRef.current) {
            if (isPaused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
            setIsPaused(!isPaused);
        }
    };

    const confirmWebsiteAd = async (websiteId) => {
        try {
            setConfirmingWebsite(websiteId);
            const response = await axios.put(
                `http://localhost:5000/api/web-advertise/confirm/${adId}/website/${websiteId}`
            );

            setAd(prevAd => ({
                ...prevAd,
                websiteStatuses: prevAd.websiteStatuses.map(status => {
                    if (status.websiteId === websiteId) {
                        return {
                            ...status,
                            confirmed: true,
                            confirmedAt: new Date().toISOString()
                        };
                    }
                    return status;
                })
            }));

            toast.success('Ad successfully confirmed for the website!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm ad');
        } finally {
            setConfirmingWebsite(null);
        }
    };

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Heading level={2} className="text-red-600 mb-4">Error loading ad</Heading>
                    <Text className="mb-6">{error}</Text>
                    <Button onClick={() => window.location.reload()} variant="primary">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Heading level={2} className="mb-4">No ad data found</Heading>
                    <Button onClick={() => navigate(-1)} variant="primary">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-gray-200 bg-white">
                <Container>
                    <div className="h-16 flex items-center justify-between">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="flex items-center text-gray-600 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            <span className="font-medium">Back</span>
                        </button>
                        <Badge variant="default">Ad Details</Badge>
                    </div>
                </Container>
            </header>
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="border border-black bg-white mb-6">
                    {ad?.videoUrl ? (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                src={ad.videoUrl}
                                autoPlay
                                loop
                                muted={muted}
                                className="w-full aspect-video"
                                onClick={togglePause}
                            />
                            {isPaused && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Play size={48} className="text-white opacity-75" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={toggleMute}
                                    className="bg-black/50 text-white p-2 border border-white"
                                >
                                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                            </div>
                        </div>
                    ) : ad?.imageUrl ? (
                        <img
                            src={ad.imageUrl}
                            alt={ad.businessName}
                            className="w-full aspect-video object-cover"
                        />
                    ) : (
                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                            <Text>No media available</Text>
                        </div>
                    )}
                </div>

                <div className="border border-black bg-white p-6 mb-6">
                    <div className="border-b border-black pb-6 mb-6">
                        <Heading level={2} className="mb-4">{ad?.businessName}</Heading>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center">
                                <Text>{(ad?.views || 0).toLocaleString()} Views</Text>
                            </div>
                            <div className="flex items-center">
                                <Text>{(ad?.clicks || 0).toLocaleString()} Clicks</Text>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <Heading level={4} className="mb-3">Description</Heading>
                        <Text>{ad?.adDescription}</Text>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <Heading level={4}>Location</Heading>
                        </div>
                        <Text>{ad?.businessLocation || 'Location not specified'}</Text>
                    </div>

                    {ad?.businessLink && (
                        <div>
                            <div className="flex items-center mb-3">
                                <Heading level={4}>Business Link</Heading>
                            </div>
                            <a 
                                href={ad.businessLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-black break-all"
                            >
                                {ad.businessLink}
                            </a>
                        </div>
                    )}
                </div>

                {ad?.websiteStatuses && ad.websiteStatuses.length > 0 && (
                    <div className="mb-12">
                        <Heading level={3} className="mb-6">Website Confirmations</Heading>
                        <Grid cols={1} gap={4}>
                            {ad.websiteStatuses.map((status, index) => (
                                <div key={status.websiteId || index} className="border border-black bg-white p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <Heading level={4} className="mb-2">{status.websiteName || 'Unknown Website'}</Heading>
                                            <div className="flex items-center space-x-6">
                                                <Text>
                                                    {status.approvedAt ? new Date(status.approvedAt).toLocaleDateString() : 'Pending'}
                                                </Text>
                                                <Text>
                                                    ${status.categories ? status.categories.reduce((sum, cat) => sum + (cat.price || 0), 0) : 0}
                                                </Text>
                                            </div>
                                        </div>
                                        
                                        {status.approved ? (
                                            <Badge variant="default" className="flex items-center text-xs px-2 py-1">
                                                Approved
                                            </Badge>
                                        ) : (
                                            <Badge variant="primary" className="flex items-center text-xs px-2 py-1">
                                                Pending
                                            </Badge>
                                        )}
                                    </div>

                                    {status.categories && status.categories.length > 0 && (
                                        <div className="mb-4">
                                            {status.categories.map((cat, idx) => (
                                                <Text key={idx} variant="muted" className="block">
                                                    {cat.categoryName || 'Category'} - ${cat.price || 0}
                                                </Text>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="flex space-x-3">
                                        {status.approved && !status.confirmed && (
                                            <Button
                                                onClick={() => confirmWebsiteAd(status.websiteId)}
                                                disabled={confirmingWebsite === status.websiteId}
                                                variant="success"
                                                size="sm"
                                            >
                                                {confirmingWebsite === status.websiteId ? 'Confirming...' : 'Confirm Ad'}
                                            </Button>
                                        )}
                                        
                                        {status.confirmed && (
                                            <Badge variant="success">Confirmed</Badge>
                                        )}
                                        
                                        <Button
                                            onClick={() => setSelectedWebsiteId(status.websiteId)}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Pay Now
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </Grid>
                    </div>
                )}
            </div>
            
            {selectedWebsiteId && (
                <PaymentModal
                    ad={ad}
                    websiteId={selectedWebsiteId}
                    onClose={() => setSelectedWebsiteId(null)}
                />
            )}
        </div>
    );
}

export default AdDetails;