import { useWrappedClientContext } from 'contexts/client'
import { ReactElement, useEffect, useState } from 'react'
import {
  CredentialDegree,
  CredentialEmployment,
  CredentialEnum,
  CredentialEvent,
  UserInfo,
} from 'contracts/MyProject.types'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { MyProjectClient } from 'contracts/MyProject.client'
import { NEXT_APP_CONTRACT_ADDRESS } from 'constants/constants'
import Image from 'next/image'

interface ReadOnlyProfileSectionProps {
  credentials: CredentialEnum[]
}

interface ProfileHeaderProps {
  walletAddress: string
  requestedProfileWalletAddress: string
  userInfo: UserInfo | undefined
  toggle?: ReactElement
  onSubscribe?: () => void
  setUserInfo?: (userInfo: UserInfo) => void
  setIsEdit?: (isEdit: boolean) => void
}

export interface ProfileProps {
  walletAddress: string
  userInfo: UserInfo | undefined
  credentials: CredentialEnum[]
  isUpdatable: boolean
}

interface ListItemProps<T> {
  data: T
}

interface SectionProps<T> {
  state: T[]
}

interface GroupedCredentials {
  employments: CredentialEmployment[]
  degrees: CredentialDegree[]
  events: CredentialEvent[]
}

const groupCredentials = (
  credentials: CredentialEnum[]
): GroupedCredentials => {
  const employments: CredentialEmployment[] = []
  const degrees: CredentialDegree[] = []
  const events: CredentialEvent[] = []

  for (const credential of credentials) {
    if ('Employment' in credential) {
      employments.push(credential.Employment.data)
    }
    if ('Degree' in credential) {
      degrees.push(credential.Degree.data)
    }
    if ('Event' in credential) {
      events.push(credential.Event.data)
    }
  }
  return {
    employments,
    degrees,
    events,
  }
}

const Divider = () => {
  return (
    <hr className="my-2 h-0.5 border-t-0 bg-gray-300 opacity-100 dark:opacity-50" />
  )
}

const EmploymentListItem = ({ data }: ListItemProps<CredentialEmployment>) => {
  return (
    <div className="mb-2 pb-2 border-b">
      <p className="text-xl font-bold">{data.institution_name}</p>
      <p className="text-sm border-secondary">
        {data.start_year ?? 'Unknown'}-{data.end_year ?? 'Present'}
      </p>
    </div>
  )
}

const DegreeListItem = ({ data }: ListItemProps<CredentialDegree>) => {
  return (
    <div className="mb-2 pb-2 border-b">
      <p className="text-xl font-bold">{data.institution_name}</p>
      <p className="text-sm border-secondary">{data.year ?? 'N/A'}</p>
    </div>
  )
}

const EventListItem = ({ data }: ListItemProps<CredentialEvent>) => {
  return (
    <div className="mb-2 pb-2 border-b">
      <p className="text-xl font-bold">{data.event_name}</p>
      <p className="text-sm border-secondary">{data.year ?? 'N/A'}</p>
    </div>
  )
}

const EditableProfileHeader = ({
  userInfo,
  toggle,
  setUserInfo,
  setIsEdit
}: ProfileHeaderProps) => {
  const { contractClient, auth } = useWrappedClientContext()

  const [username, setUsername] = useState<string | undefined>(
    userInfo?.username
  )
  const [bio, setBio] = useState<string | undefined>(userInfo?.bio)

  const onSaveHandler = async () => {
    if (auth) {
      const userInfo = {
        username: username ?? '',
        bio: bio ?? '',
        did: auth.did,
      }
      await contractClient
        ?.register(
          userInfo,
          {
            amount: [],
            gas: '1000000',
          },
          'Registration',
          [{ denom: 'utestcore', amount: '100' }]
        )
        .then((res: any) => {
          console.log('Registered!')
          console.log(res)
        })
      setUserInfo && setUserInfo(userInfo)
      setIsEdit && setIsEdit(false)
    }
  }

  const onUsernameChangeHandler = (e: any) => {
    setUsername(e.target.value)
  }

  const onBioChangeHandler = (e: any) => {
    setBio(e.target.value)
  }

  return (
    <div className="my-4 p-8 text-left rounded-xl bg-white flex gap-8">
      <Image
        src="/person-icon-1682.png"
        alt="Profile icon"
        width={240}
        height={294}
      />
      <div className="text-lg">
        <div className="flex flex-col align-center gap-5">
          {toggle}
          <h1 className="font-bold text-4xl">About</h1>
          <input
            defaultValue={username}
            className="text-xl px-4 py-2 rounded-xl bg-secondary"
            onChange={onUsernameChangeHandler}
            placeholder={'Enter fullname or username'}
          />
          {/* <h2 className="font-bold text-3xl">Some Username</h2> */}
          <textarea
            defaultValue={bio}
            className="text-sm font-bold px-4 py-2 rounded-xl bg-secondary"
            onChange={onBioChangeHandler}
            placeholder={'Enter a short bio'}
          />
          <button
            className="px-2 py-1 text-md text-primary border border-primary rounded-full text-neutral hover:border-primary hover:bg-primary hover:text-secondary"
            onClick={onSaveHandler}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const ReadOnlyProfileHeader = ({
  userInfo,
  walletAddress,
  requestedProfileWalletAddress,
  onSubscribe,
  toggle,
}: ProfileHeaderProps) => {
  if (!userInfo) {
    return <>No user info available!</>
  }
  const shouldRenderSubscribeButton = walletAddress !== requestedProfileWalletAddress
  return (
    <div className="my-4 p-8 text-left rounded-xl bg-white flex gap-8">
      <Image
        src="/person-icon-1682.png"
        alt="Profile icon"
        width={240}
        height={294}
      />
      <div className="text-lg">
        <div className="flex flex-col align-center gap-5">
          {toggle}
          {shouldRenderSubscribeButton && (<button className='px-2 py-1 text-md text-primary border border-primary rounded-full text-neutral hover:border-primary hover:bg-primary hover:text-secondary' onClick={onSubscribe}>SUBSCRIBE!</button>)}
          <h1 className="font-bold text-4xl">About</h1>
          <div className="text-xl px-4 py-2 rounded-xl bg-secondary">
            {userInfo.username}
          </div>
          <div className="text-sm font-bold px-4 py-2 rounded-xl bg-secondary">
            {userInfo.bio}
          </div>
        </div>
      </div>
    </div>
  )
}

const EmploymentSection = ({ state }: SectionProps<CredentialEmployment>) => {
  if (state.length === 0) {
    return <></>
  }
  return (
    <div className="mb-4 py-3 px-6 text-left rounded-xl bg-white">
      <h1 className="font-bold text-3xl mb-6">Employment</h1>
      {state
        .sort(
          (a, b) =>
            (b.end_year ?? 99999 + (b.start_year ?? 0)) -
            (a.end_year ?? 99999 + (a.start_year ?? 0))
        )
        .map((value, index) => (
          <>
            <EmploymentListItem data={value} key={index} />
            {index < state.length - 1 && <Divider />}
          </>
        ))}
    </div>
  )
}

const DegreeSection = ({ state }: SectionProps<CredentialDegree>) => {
  if (state.length === 0) {
    return <></>
  }
  return (
    <div className="mb-4 py-3 px-6 text-left rounded-xl bg-white">
      <h1 className="font-bold text-3xl mb-6">Education</h1>
      {state
        .sort((a, b) => b.year - a.year)
        .map((value, index) => (
          <>
            <DegreeListItem data={value} key={index} />
            {index < state.length - 1 && <Divider />}
          </>
        ))}
    </div>
  )
}

const EventSection = ({ state }: SectionProps<CredentialEvent>) => {
  if (state.length === 0) {
    return <></>
  }
  return (
    <div className="mb-4 py-3 px-6 text-left rounded-xl bg-white">
      <h1 className="font-bold text-3xl mb-6">Events</h1>
      {state
        .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
        .map((value, index) => (
          <>
            <EventListItem data={value} key={index} />
            {index < state.length - 1 && <Divider />}
          </>
        ))}
    </div>
  )
}

const ReadOnlyProfileSection = ({
  credentials,
}: ReadOnlyProfileSectionProps) => {
  const { employments, degrees, events } = groupCredentials(credentials)
  return (
    <div className="flex flex-col flex-wrap gap-2 grow">
      <EmploymentSection state={employments} />
      <DegreeSection state={degrees} />
      <EventSection state={events} />
    </div>
  )
}

const fetchUserInfo = async (
  signingClient: SigningCosmWasmClient,
  requestedProfileWalletAddress: string
) => {
  try {
    const response = await signingClient?.queryContractSmart(
      NEXT_APP_CONTRACT_ADDRESS,
      {
        resolve_user_info: {
          address: requestedProfileWalletAddress,
        },
      }
    )
    return response.user_info
  } catch (e) {
    return undefined
  }
}

const fetchCredentials = async (
  contractClient: MyProjectClient,
  requestedProfileWalletAddress: string
): Promise<CredentialEnum[]> => {
  try {
    const response = await contractClient.listCredentials({
      address: requestedProfileWalletAddress,
    })
    return response.credentials
  } catch (e) {
    console.error(e)
    return []
  }
}

const Profile = () => {
  const {
    requestedProfile,
    walletAddress,
    signingClient,
    contractClient,
    auth,
    backendService
  } = useWrappedClientContext()
  const { walletAddress: requestedProfileWalletAddress } = requestedProfile
  const [userInfo, setUserInfo] = useState<UserInfo>()
  const [credentials, setCredentials] = useState<CredentialEnum[]>([])
  const [verifiableCredentials, setVerifiableCredentials] = useState<any[]>([])
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const coreumDenom = 'utestcore'
  const onSubscribe = async (targetProfile: string) => {
    if (auth && contractClient) {
      contractClient
        .subscirbe(
          { targetProfile },
          {
            amount: [{ denom: coreumDenom, amount: '100000' }],
            gas: '1000000',
          },
          'issue VC',
          [{ denom: coreumDenom, amount: '100' }]
        )
        .then((res: any) => {
          console.log('SUBSCRIBED!')
          console.log(res)
        })
    }
  }

  useEffect(() => {
    if (requestedProfileWalletAddress && auth) {
      if (signingClient) {
        fetchUserInfo(signingClient, requestedProfileWalletAddress)
          .then((userInfo) => {
            console.log('userInfo', userInfo)
            setUserInfo(userInfo)
          })
          .catch(console.error)
      }
      if (contractClient) {
        fetchCredentials(contractClient, requestedProfileWalletAddress)
          .then(
            (credentials) => {
              console.log('creds', credentials)
              setCredentials(credentials)
            }
          )
          .catch(console.error)
        contractClient
          .isSubscribed({
            requesterAddress: walletAddress,
            targetAddress: requestedProfileWalletAddress,
          })
          .then((val) => {
            console.log('sub response')
            console.log(val)
            setIsSubscribed(val.subscribed)
          })
          .catch(console.error)
      }

      if (requestedProfileWalletAddress === walletAddress) {
        backendService.listOwnCredentials(walletAddress, auth).then((vcs) => {
          console.log('Got my credentials!')
          console.log(vcs)
          setVerifiableCredentials(vcs)
        })
      } else if (isSubscribed) {
        // TODO - move to bakcend
        backendService
          .listOtherCredentials(
            walletAddress,
            requestedProfileWalletAddress,
            auth
          )
          .then((vcs) => {
            console.log('Got other credentials!')
            console.log(vcs)
            setVerifiableCredentials(vcs)
          })
      }
    }
  }, [
    signingClient,
    isSubscribed,
    contractClient,
    requestedProfileWalletAddress,
    auth,
  ])

  if (!requestedProfileWalletAddress) {
    return <></>
  }

  const isEditable = walletAddress === requestedProfileWalletAddress
  const shouldRenderEditable = isEditable && (isEdit || !userInfo)
  const toggle = (
    <h1 className="text-3xl">
      Edit{' '}
      <input
        type="checkbox"
        className="toggle"
        checked={isEdit}
        onClick={() => setIsEdit(!isEdit)}
      />
    </h1>
  )

  return (
    <>
      <div>
        {shouldRenderEditable ? (
          <EditableProfileHeader
            userInfo={userInfo}
            walletAddress={walletAddress}
            requestedProfileWalletAddress={requestedProfileWalletAddress}
            toggle={(isEditable && userInfo) ? toggle : undefined}
            setUserInfo={setUserInfo}
            setIsEdit={setIsEdit}
          />
        ) : (
          <ReadOnlyProfileHeader
            userInfo={userInfo}
            walletAddress={walletAddress}
            requestedProfileWalletAddress={requestedProfileWalletAddress}
            onSubscribe={() => onSubscribe(requestedProfileWalletAddress)}
            toggle={(isEditable && userInfo) ? toggle : undefined}
          />
        )}
        <ReadOnlyProfileSection credentials={credentials} />
      </div>
      <h1 className="font-bold text-4xl">Verifiable credentials</h1>
      <div className='max-w-screen-lg'>{JSON.stringify(verifiableCredentials)}</div>
    </>
  )
}

export default Profile
