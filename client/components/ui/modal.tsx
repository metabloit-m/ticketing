import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@nextui-org/react';
import Link from 'next/link';

interface ViewItemProps {
  link: string;
  title: string;
  action: string;
  icon: React.ComponentType;
  cb?: () => void;
  children: React.ReactNode;
}

export default function ViewItem({
  link,
  title,
  action,
  icon,
  cb,
  children,
}: ViewItemProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [backdrop, setBackdrop] = React.useState('opaque');

  const handleOpen = (backdrop) => {
    setBackdrop(backdrop);
    onOpen();
  };

  const Icon = icon;

  return (
    <>
      <div className='flex flex-wrap gap-3'>
        <Icon key={link} onClick={() => handleOpen('blur')} />
      </div>
      <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>{title}</ModalHeader>
              <ModalBody>{children}</ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button>
                <Button onClick={cb} color='primary'>
                  {action}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
